import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const FIREBASE_CONFIG = {
  apiKey:            'AIzaSyD2zxSXuxtDKyuXKTpDDjfnKdyhLcLs59c',
  authDomain:        'meraki-salon-manager.firebaseapp.com',
  projectId:         'meraki-salon-manager',
  storageBucket:     'meraki-salon-manager.firebasestorage.app',
  messagingSenderId: '721171829996',
  appId:             '1:721171829996:web:57f1a33d174c966b7fc1c9',
};

const app = initializeApp(FIREBASE_CONFIG);
export const db   = getFirestore(app);
export const auth = getAuth(app);

export const ALLOWED_EMAILS = ['jvankim@gmail.com'];
