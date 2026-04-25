import type { ReactNode } from "react";

/**
 * App wrapper. Without Firebase env vars the app still runs in demo/read-only mode.
 */
export function FirebaseSetupGate({ children }: { children: ReactNode }) {
  return <>{children}</>;
}