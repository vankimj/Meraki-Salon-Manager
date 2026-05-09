import { initializeApp } from 'firebase/app';
import { getFunctions, httpsCallable } from 'firebase/functions';

const firebaseConfig = {
  apiKey:            'AIzaSyD2zxSXuxtDKyuXKTpDDjfnKdyhLcLs59c',
  authDomain:        'meraki-salon-manager.firebaseapp.com',
  projectId:         'meraki-salon-manager',
  storageBucket:     'meraki-salon-manager.firebasestorage.app',
  messagingSenderId: '721171829996',
  appId:             '1:721171829996:web:57f1a33d174c966b7fc1c9',
};

const app = initializeApp(firebaseConfig);
const fns = getFunctions(app);

export const callMarketingChat = httpsCallable(fns, 'chatWithMarketing');
export const callContactInquiry = httpsCallable(fns, 'submitContactInquiry');
