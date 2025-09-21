// Import the functions you need from the SDKs you need
import {initializeApp, getApps, getApp} from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: 'studio-9338054386-b4f6b',
  appId: '1:216169399222:web:e0997b50643a6a959f3717',
  apiKey: 'AIzaSyCEvQlafHeB067kniC7gmiaqx42mmcqxhw',
  authDomain: 'studio-9338054386-b4f6b.firebaseapp.com',
  measurementId: '',
  messagingSenderId: '216169399222',
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
