import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';

const FIREBASE_CONFIG = {
  apiKey:            'AIzaSyD2zxSXuxtDKyuXKTpDDjfnKdyhLcLs59c',
  authDomain:        'meraki-salon-manager.firebaseapp.com',
  projectId:         'meraki-salon-manager',
  storageBucket:     'meraki-salon-manager.firebasestorage.app',
  messagingSenderId: '721171829996',
  appId:             '1:721171829996:web:57f1a33d174c966b7fc1c9',
};

const app = getApps().length ? getApps()[0] : initializeApp(FIREBASE_CONFIG);

export const auth      = getAuth(app);
export const db        = getFirestore(app);
export const functions = getFunctions(app);
export const callFn    = (name) => httpsCallable(functions, name);
export const googleProvider = new GoogleAuthProvider();

export const ALLOWED_EMAILS = ['jvankim@gmail.com'];
export const TENANT_ID = 'meraki';
