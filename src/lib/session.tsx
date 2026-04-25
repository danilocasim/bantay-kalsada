import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getIdTokenResult, onAuthStateChanged } from "firebase/auth";
import { DEMO_USER_ID, isDemoMode } from "@/lib/dataSource";
import { ensureSignedInUser, getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase";

export type SessionRole = "citizen" | "agency_official" | "admin";

type SessionState = {
  isReady: boolean;
  isDemo: boolean;
  userId: string | null;
  /** From Firebase profile when configured; null in demo or anonymous without a set name. */
  displayName: string | null;
  /** Present when the user signed in with email; usually null for anonymous auth. */
  email: string | null;
  role: SessionRole;
  agencyId: string | null;
  isAgency: boolean;
  isAdmin: boolean;
  isAnonymous: boolean;
};

const DEFAULT_SESSION: SessionState = {
  isReady: true,
  isDemo: true,
  userId: DEMO_USER_ID,
  displayName: null,
  email: null,
  role: "citizen",
  agencyId: null,
  isAgency: false,
  isAdmin: false,
  isAnonymous: false,
};

const SessionContext = createContext<SessionState>(DEFAULT_SESSION);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionState>(DEFAULT_SESSION);

  useEffect(() => {
    if (!isFirebaseConfigured || isDemoMode) {
      setSession(DEFAULT_SESSION);
      return;
    }

    let cancelled = false;
    const auth = getFirebaseAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (cancelled) return;

      if (!user) {
        try {
          await ensureSignedInUser();
          return;
        } catch {
          if (!cancelled) {
            setSession({
              isReady: true,
              isDemo: false,
              userId: null,
              displayName: null,
              email: null,
              role: "citizen",
              agencyId: null,
              isAgency: false,
              isAdmin: false,
              isAnonymous: false,
            });
          }
          return;
        }
      }

      try {
        const token = await getIdTokenResult(user);
        const role = (token.claims.role as SessionRole | undefined) ?? "citizen";
        const agencyId = (token.claims.agencyId as string | undefined) ?? null;

        if (!cancelled) {
          setSession({
            isReady: true,
            isDemo: false,
            userId: user.uid,
            displayName: user.displayName?.trim() || null,
            email: user.email?.trim() || null,
            role,
            agencyId,
            isAgency: role === "agency_official" || role === "admin",
            isAdmin: role === "admin",
            isAnonymous: user.isAnonymous,
          });
        }
      } catch {
        if (!cancelled) {
          setSession({
            isReady: true,
            isDemo: false,
            userId: user.uid,
            displayName: user.displayName?.trim() || null,
            email: user.email?.trim() || null,
            role: "citizen",
            agencyId: null,
            isAgency: false,
            isAdmin: false,
            isAnonymous: user.isAnonymous,
          });
        }
      }
    });

    setSession((current) => ({ ...current, isReady: false, isDemo: false, userId: null }));

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const value = useMemo(() => session, [session]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionState {
  return useContext(SessionContext);
}
