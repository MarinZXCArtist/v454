import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  increment,
  getDocs
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { PhotoItem, QuoteItem, SongSettings } from '../types';
import { DEFAULT_PHOTOS, DEFAULT_QUOTES, DEFAULT_SONG } from '../data/defaultData';

// Initialize Firebase safely
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Get Firestore with databaseId specified in config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);

// Firestore Collection Names
const PHOTOS_COLLECTION = 'love_photos';
const QUOTES_COLLECTION = 'love_quotes';
const SETTINGS_COLLECTION = 'love_settings';

function getDeletedPhotoIds(): string[] {
  try {
    const stored = localStorage.getItem('love_deleted_photo_ids');
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
}

let photoCallbacks: Array<(photos: PhotoItem[]) => void> = [];

/**
 * Subscribe to real-time Photo updates from Firebase
 */
export function subscribePhotos(callback: (photos: PhotoItem[]) => void) {
  photoCallbacks.push(callback);

  const notifyAll = (items: PhotoItem[]) => {
    photoCallbacks.forEach((cb) => cb(items));
  };

  try {
    const q = query(collection(db, PHOTOS_COLLECTION), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const deletedIds = getDeletedPhotoIds();
        if (snapshot.empty) {
          const stored = localStorage.getItem('love_photos_local');
          let baseList = DEFAULT_PHOTOS;
          if (stored) {
            try { baseList = JSON.parse(stored); } catch (e) {}
          }
          const filtered = baseList.filter((p) => !deletedIds.includes(p.id));
          notifyAll(filtered);
        } else {
          const items: PhotoItem[] = snapshot.docs
            .map((docSnap) => ({
              id: docSnap.id,
              ...(docSnap.data() as Omit<PhotoItem, 'id'>)
            }))
            .filter((p) => !deletedIds.includes(p.id));
          notifyAll(items);
        }
      },
      (error) => {
        console.warn('Firestore subscription error, falling back to local storage:', error);
        const deletedIds = getDeletedPhotoIds();
        const stored = localStorage.getItem('love_photos_local');
        let baseList = DEFAULT_PHOTOS;
        if (stored) {
          try { baseList = JSON.parse(stored); } catch (e) {}
        }
        notifyAll(baseList.filter((p) => !deletedIds.includes(p.id)));
      }
    );

    return () => {
      photoCallbacks = photoCallbacks.filter((cb) => cb !== callback);
      unsubscribe();
    };
  } catch (err) {
    console.error('Failed to subscribe photos:', err);
    const deletedIds = getDeletedPhotoIds();
    notifyAll(DEFAULT_PHOTOS.filter((p) => !deletedIds.includes(p.id)));
    return () => {
      photoCallbacks = photoCallbacks.filter((cb) => cb !== callback);
    };
  }
}

/**
 * Add a new photo to Firebase Firestore
 */
export async function addPhotoToFirebase(photo: Omit<PhotoItem, 'id' | 'createdAt' | 'likes'>): Promise<string> {
  const photoData = {
    ...photo,
    createdAt: Date.now(),
    likes: 0
  };

  try {
    const docRef = await addDoc(collection(db, PHOTOS_COLLECTION), photoData);
    return docRef.id;
  } catch (err) {
    console.warn('Firebase addPhoto failed, saving locally:', err);
    const stored = localStorage.getItem('love_photos_local');
    const existing: PhotoItem[] = stored ? JSON.parse(stored) : DEFAULT_PHOTOS;
    const newLocalItem: PhotoItem = {
      ...photoData,
      id: 'local-' + Date.now()
    };
    localStorage.setItem('love_photos_local', JSON.stringify([newLocalItem, ...existing]));
    return newLocalItem.id;
  }
}

/**
 * Delete a photo from Firebase Firestore
 */
export async function deletePhotoFromFirebase(photoId: string): Promise<void> {
  const deletedIds = getDeletedPhotoIds();
  if (!deletedIds.includes(photoId)) {
    deletedIds.push(photoId);
    localStorage.setItem('love_deleted_photo_ids', JSON.stringify(deletedIds));
  }

  const stored = localStorage.getItem('love_photos_local');
  if (stored) {
    try {
      const existing: PhotoItem[] = JSON.parse(stored);
      const filtered = existing.filter((p) => p.id !== photoId);
      localStorage.setItem('love_photos_local', JSON.stringify(filtered));
    } catch (e) {}
  }

  if (!photoId.startsWith('local-') && !photoId.startsWith('def-')) {
    try {
      await deleteDoc(doc(db, PHOTOS_COLLECTION, photoId));
    } catch (err) {
      console.error('Failed to delete photo from Firestore:', err);
    }
  }

  // Immediately notify all active photo listeners
  const currentDeleted = getDeletedPhotoIds();
  try {
    const snap = await getDocs(query(collection(db, PHOTOS_COLLECTION), orderBy('createdAt', 'desc')));
    if (snap.empty) {
      const storedLocal = localStorage.getItem('love_photos_local');
      let baseList = DEFAULT_PHOTOS;
      if (storedLocal) {
        try { baseList = JSON.parse(storedLocal); } catch (e) {}
      }
      const remaining = baseList.filter((p) => !currentDeleted.includes(p.id));
      photoCallbacks.forEach((cb) => cb(remaining));
    } else {
      const items: PhotoItem[] = snap.docs
        .map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<PhotoItem, 'id'>)
        }))
        .filter((p) => !currentDeleted.includes(p.id));
      photoCallbacks.forEach((cb) => cb(items));
    }
  } catch (e) {
    const remaining = DEFAULT_PHOTOS.filter((p) => !currentDeleted.includes(p.id));
    photoCallbacks.forEach((cb) => cb(remaining));
  }
}

/**
 * Increment photo likes in Firebase
 */
export async function likePhotoInFirebase(photoId: string): Promise<void> {
  if (photoId.startsWith('local-') || photoId.startsWith('def-')) {
    const stored = localStorage.getItem('love_photos_local');
    const existing: PhotoItem[] = stored ? JSON.parse(stored) : DEFAULT_PHOTOS;
    const updated = existing.map((p) => (p.id === photoId ? { ...p, likes: (p.likes || 0) + 1 } : p));
    localStorage.setItem('love_photos_local', JSON.stringify(updated));
    return;
  }

  try {
    const photoRef = doc(db, PHOTOS_COLLECTION, photoId);
    await updateDoc(photoRef, {
      likes: increment(1)
    });
  } catch (err) {
    console.error('Failed to like photo in Firestore:', err);
  }
}

/**
 * Subscribe to Love Quotes from Firebase
 */
export function subscribeQuotes(callback: (quotes: QuoteItem[]) => void) {
  try {
    const q = query(collection(db, QUOTES_COLLECTION), orderBy('createdAt', 'desc'));
    
    return onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          callback(DEFAULT_QUOTES);
        } else {
          const items: QuoteItem[] = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<QuoteItem, 'id'>)
          }));
          callback(items);
        }
      },
      (error) => {
        console.warn('Firestore quotes sub error:', error);
        callback(DEFAULT_QUOTES);
      }
    );
  } catch (err) {
    callback(DEFAULT_QUOTES);
    return () => {};
  }
}

/**
 * Add a new quote to Firebase
 */
export async function addQuoteToFirebase(text: string, author: string = 'Марин'): Promise<void> {
  const quoteData = {
    text,
    author,
    createdAt: Date.now()
  };

  try {
    await addDoc(collection(db, QUOTES_COLLECTION), quoteData);
  } catch (err) {
    console.warn('Failed to add quote to Firestore:', err);
  }
}
