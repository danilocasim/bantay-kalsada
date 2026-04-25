# Bantay Kalsada — Firebase backend

Configures Firestore rules, Storage rules, indexes, and Cloud Functions.

## What you need to configure

This repo expects these Firebase services:

- Firebase Web App config
- Authentication
- Firestore Database
- Storage
- Cloud Functions
- Cloud Messaging / VAPID key for web push (optional)

Frontend env vars are read from `src/lib/firebase.ts`.

## Env example

Copy the root `.env.example` file to `.env.local` for local development.

```env
VITE_FIREBASE_API_KEY=your_firebase_web_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
VITE_FIREBASE_VAPID_KEY=your_web_push_vapid_public_key
```

Notes:

- `VITE_FIREBASE_VAPID_KEY` is optional unless you want web push now.
- These are public web-app config values. They are safe to ship in the client.
- Do not put `GEMINI_API_KEY` in client env files. That secret belongs in Cloud Functions secrets only.

## Step-by-step

### 1. Create the Firebase project

In Firebase Console:

1. Click **Add project**.
2. Enter your project name.
3. Finish project creation.

### 2. Add a Web App

In Firebase Console:

1. Open your project.
2. Click the **Web** app icon (`</>`).
3. Register the app.
4. Copy the config values from the generated snippet.

You need these values:

- `apiKey`
- `authDomain`
- `projectId`
- `storageBucket`
- `messagingSenderId`
- `appId`

### 3. Add the frontend env vars

For local development:

1. Copy `.env.example` to `.env.local`.
2. Paste the values from Firebase Console.

For Lovable:

1. Open **Project Settings**.
2. Open **Environment Variables**.
3. Add the same `VITE_FIREBASE_*` values there.

If these vars are missing, the app stays in demo mode.

### 4. Enable Authentication providers

Firebase Console -> **Authentication** -> **Sign-in method**

Enable:

- **Email/Password**
- **Google**
- **Anonymous**

If Google asks for a support email, set it.

### 5. Create Firestore Database

Firebase Console -> **Firestore Database**

1. Click **Create database**.
2. Pick a region close to your pilot users.
3. Finish setup.

You do not need to hand-edit rules in the console. This repo deploys its own rules and indexes.

### 6. Create Storage

Firebase Console -> **Storage**

1. Click **Get started**.
2. Pick the same region if possible.
3. Finish setup.

This repo currently expects image uploads for reports.

### 7. Optional: enable Cloud Messaging for web push

Only do this now if you want push notifications.

Firebase Console -> **Project settings** -> **Cloud Messaging**

1. Under **Web Push certificates**, generate a key pair.
2. Copy the public key.
3. Put it in `VITE_FIREBASE_VAPID_KEY`.

You can skip this for the hackathon if push is not a priority yet.

### 8. Upgrade the project to Blaze

Cloud Functions require the **Blaze** plan.

In Firebase Console:

1. Open **Usage and billing**.
2. Upgrade to **Blaze**.

### 9. Install Firebase CLI on your machine

```bash
npm i -g firebase-tools
firebase login
```

### 10. Link the local `firebase/` folder to your Firebase project

From the `firebase/` directory:

```bash
firebase use --add
```

Pick the Firebase project you created.

### 11. Set the Gemini secret for Cloud Functions

This repo's `analyzeReport` function uses `GEMINI_API_KEY`.

From the `firebase/` directory:

```bash
firebase functions:secrets:set GEMINI_API_KEY
```

Do not store this in `.env.local`.

### 12. Install and build the Cloud Functions

From the `firebase/functions/` directory:

```bash
npm install
npm run build
```

This functions package targets Node 20.

### 13. Deploy rules, indexes, storage rules, and functions

From the `firebase/` directory:

```bash
firebase deploy --only firestore:rules,firestore:indexes,storage,functions
```

### 14. Verify the setup

You should check these:

1. The top demo banner disappears after env vars are set and the app is restarted.
2. Auth can sign in successfully.
3. Firestore reads and writes work.
4. Storage can upload an image.
5. Functions deploy without errors.

## One-time setup (CLI summary)

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

Example values live in the root `.env.example` file.

## Promoting an agency official

After deploy, call setUserRole as an admin to grant agency_official to a UID.
Bootstrap: set yourself as admin via Firebase Console → Auth → custom claims.
