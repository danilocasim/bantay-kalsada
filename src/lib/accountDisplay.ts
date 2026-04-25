/** Display helpers for profile and support — no PII beyond what Firebase already exposes. */

export function accountTitle(displayName: string | null, email: string | null, isDemo: boolean): string {
  if (displayName?.trim()) return displayName.trim();
  if (email?.trim()) {
    const local = email.trim().split("@")[0];
    if (local) return local;
  }
  if (isDemo) return "Pilot participant";
  return "Community reporter";
}

export function accountPrimarySubtitle(session: {
  isDemo: boolean;
  isAnonymous: boolean;
  email: string | null;
}): string {
  if (session.isDemo) return "Pilot demo · local data on this device";
  if (session.email?.trim()) return `Signed in as ${session.email.trim()}`;
  if (session.isAnonymous) return "Anonymous sign-in · name hidden on reports";
  return "Signed in";
}

/** Short, copy-friendly reference for support tickets. */
export function accountReferenceId(userId: string | null, isDemo: boolean): string | null {
  if (!userId) return null;
  if (isDemo) return `Pilot ID · ${userId}`;
  if (userId.length <= 12) return `Account · ${userId}`;
  return `Ref ····${userId.slice(-6)}`;
}

export function avatarInitial(title: string): string {
  const t = title.trim();
  if (!t) return "?";
  return t[0]!.toUpperCase();
}
