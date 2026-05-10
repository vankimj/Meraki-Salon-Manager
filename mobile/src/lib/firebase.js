import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, getAuth, GoogleAuthProvider } from 'firebase/auth';
import * as FirebaseAuth from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FIREBASE_CONFIG = {
  apiKey:            'AIzaSyD2zxSXuxtDKyuXKTpDDjfnKdyhLcLs59c',
  authDomain:        'meraki-salon-manager.firebaseapp.com',
  projectId:         'meraki-salon-manager',
  storageBucket:     'meraki-salon-manager.firebasestorage.app',
  messagingSenderId: '721171829996',
  appId:             '1:721171829996:web:57f1a33d174c966b7fc1c9',
};

const app = getApps().length ? getApps()[0] : initializeApp(FIREBASE_CONFIG);

// React Native needs explicit Auth init with AsyncStorage persistence.
// firebase v11 ships getReactNativePersistence in the rn-targeted
// bundle; we look it up dynamically so a non-RN bundle path (or hot
// reload re-running this module) doesn't crash. If it's unavailable
// we fall back to getAuth and accept session-loss between launches.
let _auth;
try {
  const getRNPersistence = FirebaseAuth.getReactNativePersistence;
  if (typeof getRNPersistence === 'function') {
    _auth = initializeAuth(app, { persistence: getRNPersistence(AsyncStorage) });
  } else {
    _auth = getAuth(app);
  }
} catch (e) {
  console.log('[firebase] auth init fell back to getAuth:', e?.message);
  try { _auth = getAuth(app); } catch {}
}
export const auth = _auth;

export const db        = getFirestore(app);
export const functions = getFunctions(app);
export const callFn    = (name) => httpsCallable(functions, name);
export const googleProvider = new GoogleAuthProvider();

export const ALLOWED_EMAILS = ['jvankim@gmail.com'];
export const TENANT_ID = 'meraki';
