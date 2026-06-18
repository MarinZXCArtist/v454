import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAJ5nECgP0YNgcmMq_JaEVM5iHkSZaaVx0",
  authDomain: "july2024-cfec0.firebaseapp.com",
  projectId: "july2024-cfec0",
  storageBucket: "july2024-cfec0.firebasestorage.app",
  messagingSenderId: "1054235512375",
  appId: "1:1054235512375:web:f6b520d23159dc7e6c79b2"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
