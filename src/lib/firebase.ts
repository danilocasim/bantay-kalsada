import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

/**
 * Firebase web config — these values are public and safe to ship to the client.
 * Provide them via Vite env vars so different environments can use different projects.
 *
 * In Lovable: open Project Settings → Environment Variables and add:
 *   VITE_FIREBASE_API_KEY
 *   VITE_FIREBASE_AUTH_DOMAIN
 *   VITE_FIREBASE_PROJECT_ID
 *   VITE_FIREBASE_STORAGE_BUCKET
 *   VITE_FIREBASE_MESSAGING_SENDER_ID
 *   VITE_FIREBASE_APP_ID
 *   VITE_FIREBASE_VAPID_KEY  (for FCM web push)
 */

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
};

export const isFirebaseConfigured = Boolean(
  config.apiKey && config.authDomain && config.projectId && config.appId,
);

let app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _storage: FirebaseStorage | null = null;

function ensureApp(): FirebaseApp {
  if (!isFirebaseConfigured) {
    throw new Error(
      "Firebase is not configured. Add VITE_FIREBASE_* env vars in Project Settings.",
    );
  }
  if (!app) {
    app = getApps()[0] ?? initializeApp(config as Required<typeof config>);
  }
  return app;
}

export function getFirebaseAuth(): Auth {
  if (!_auth) _auth = getAuth(ensureApp());
  return _auth;
}

export function getDb(): Firestore {
  if (!_db) _db = getFirestore(ensureApp());
  return _db;
}

export function getBucket(): FirebaseStorage {
  if (!_storage) _storage = getStorage(ensureApp());
  return _storage;
}

export const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY as string | undefined;