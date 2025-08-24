import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAtyLlnnythNYAbS8u0k0FggThxWfQozCU",
  authDomain: "tradinghub-43221.firebaseapp.com",
  projectId: "tradinghub-43221",
  storageBucket: "tradinghub-43221.firebasestorage.app",
  messagingSenderId: "911442992634",
  appId: "1:911442992634:web:4690fb60781605f4275843",
  measurementId: "G-JZ7VJHDHN4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app; 