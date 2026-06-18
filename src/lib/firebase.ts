import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDuAOf59tmTguJr0rvgvDutt-G-UYy04_c",
  authDomain: "luminous-appliance-jszp9.firebaseapp.com",
  projectId: "luminous-appliance-jszp9",
  storageBucket: "luminous-appliance-jszp9.firebasestorage.app",
  messagingSenderId: "230978222356",
  appId: "1:230978222356:web:18c0a922dc9573ea6eaa01"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, "ai-studio-6e5f7052-4a76-4951-b93b-50ffd1b89363");
