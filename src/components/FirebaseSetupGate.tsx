import { isFirebaseConfigured } from "@/lib/firebase";
import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Non-blocking demo banner. When Firebase env vars are missing, the app runs
 * in demo mode (read-only seeded data). Auth + writes still no-op gracefully.
 */
export function FirebaseSetupGate({ children }: { children: ReactNode }) {
  return (
    <>
      {!isFirebaseConfigured && <DemoBanner />}
      {children}
    </>
  );
}

function DemoBanner() {
  return (
    <div className="fixed top-0 inset-x-0 z-50 pt-safe">
      <div className="mx-auto max-w-md px-4 pt-2">
        <div className="rounded-full bg-foreground/90 text-background text-[11px] font-medium px-3.5 py-1.5 flex items-center justify-center gap-1.5 shadow-float backdrop-blur">
          <Sparkles className="h-3 w-3" />
          Demo mode — connect Firebase to enable accounts & live data
        </div>
      </div>
    </div>
  );
}