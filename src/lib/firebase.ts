import { initializeApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

export const dbDefault = getFirestore(app);
export const dbOld = getFirestore(app, "ai-studio-6e5f7052-4a76-4951-b93b-50ffd1b89363");
export const dbNamed = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : dbDefault;

export const dbContainer = {
  current: dbNamed
};


