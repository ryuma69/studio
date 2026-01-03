import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

// Initialize Firebase safely and export the services
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const firebaseApp = app;
