import { isFirebaseConfigured } from "@/lib/firebase";
import { SoftCard } from "./ui-kit";
import { AlertCircle } from "lucide-react";
import type { ReactNode } from "react";

const REQUIRED = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
];

export function FirebaseSetupGate({ children }: { children: ReactNode }) {
  if (isFirebaseConfigured) return <>{children}</>;

  return (
    <div className="min-h-screen bg-background flex items-center px-5 py-10">
      <div className="mx-auto max-w-md w-full">
        <SoftCard>
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-status-pothole/10 grid place-items-center text-status-pothole shrink-0">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-semibold tracking-tight">Connect Firebase</h1>
              <p className="text-sm text-muted-foreground mt-1.5">
                Bantay Kalsada uses Firebase for auth, database, storage, and push
                notifications. Add your project's web config as environment variables to
                continue.
              </p>
            </div>
          </div>

          <ol className="mt-5 space-y-2.5 text-sm text-foreground/90 list-decimal pl-5">
            <li>
              Create a project at{" "}
              <a className="text-primary underline" href="https://console.firebase.google.com" target="_blank" rel="noreferrer">
                console.firebase.google.com
              </a>
            </li>
            <li>Add a Web app and copy the config object</li>
            <li>Enable Email/Password, Google, and Anonymous in Authentication → Sign-in method</li>
            <li>Open Project Settings → Environment Variables in Lovable and add the values below</li>
          </ol>

          <div className="mt-5 rounded-xl bg-surface-muted border border-border p-3 font-mono text-xs leading-6">
            {REQUIRED.map((k) => (
              <div key={k}>{k}</div>
            ))}
            <div className="text-muted-foreground">VITE_FIREBASE_VAPID_KEY <span className="not-italic">(optional, for push)</span></div>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            These are public web config values — safe to ship to the client. Server-side
            secrets (like the Gemini API key) live in Cloud Functions, not here.
          </p>
        </SoftCard>
      </div>
    </div>
  );
}