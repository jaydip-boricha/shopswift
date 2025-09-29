
// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDi60AjAYIqx_E9Ib0R9nMM9d7kOzi8AWQ",
  authDomain: "studio-7980751238-4dea8.firebaseapp.com",
  projectId: "studio-7980751238-4dea8",
  storageBucket: "studio-7980751238-4dea8.appspot.com",
  messagingSenderId: "89124030291",
  appId: "1:89124030291:web:3172363c9740c8780f83a6"
};

// Initialize Firebase for SSR
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

export { app, auth, db, storage };
