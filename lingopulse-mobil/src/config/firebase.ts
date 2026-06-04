/**
 * Firebase Yapılandırması — Sadece Authentication için.
 *
 * .env.local'de EXPO_PUBLIC_FIREBASE_API_KEY doluysa Firebase aktif olur.
 * Boşsa uygulama mevcut e-posta/şifre auth'u kullanmaya devam eder.
 */

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '';

export const isFirebaseConfigured = apiKey.length > 0;

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;

if (isFirebaseConfigured) {
  const firebaseConfig = {
    apiKey,
    authDomain:        process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN         ?? '',
    projectId:         process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID          ?? '',
    storageBucket:     process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET      ?? '',
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
    appId:             process.env.EXPO_PUBLIC_FIREBASE_APP_ID              ?? '',
  };
  _app  = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  _auth = getAuth(_app);
}

export const firebaseApp  = _app;
export const firebaseAuth = _auth;
