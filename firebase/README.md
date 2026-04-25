# Bantay Kalsada — Firebase backend

Configures Firestore rules, Storage rules, indexes, and Cloud Functions.

## One-time setup (run on your machine)

1. `npm i -g firebase-tools` then `firebase login`
2. From this `firebase/` folder: `firebase use --add` and pick your project
3. Firebase Console → Authentication → Sign-in method: enable Email/Password, Google, Anonymous
4. Upgrade to Blaze plan (required for Cloud Functions)
5. `firebase functions:secrets:set GEMINI_API_KEY`
6. `cd functions && npm install && npm run build && cd ..`
7. `firebase deploy --only firestore:rules,firestore:indexes,storage,functions`

## In the Lovable app

Add these env vars in Project Settings → Environment Variables:

- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_AUTH_DOMAIN
- VITE_FIREBASE_PROJECT_ID
- VITE_FIREBASE_STORAGE_BUCKET
- VITE_FIREBASE_MESSAGING_SENDER_ID
- VITE_FIREBASE_APP_ID
- VITE_FIREBASE_VAPID_KEY (optional, for web push)

## Promoting an agency official

After deploy, call setUserRole as an admin to grant agency_official to a UID.
Bootstrap: set yourself as admin via Firebase Console → Auth → custom claims.
