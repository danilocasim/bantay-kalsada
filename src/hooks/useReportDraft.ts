import { useEffect, useState } from "react";
import type { Category } from "@/lib/types";

const DRAFT_KEY = "bk_report_draft_v1";

export type ReportDraft = {
  photo?: string;
  coords?: { lat: number; lng: number };
  category: Category;
  description: string;
};

const DEFAULT_DRAFT: ReportDraft = {
  category: "pothole",
  description: "",
};

const toStorageFallbackPayload = (draft: ReportDraft): Omit<ReportDraft, "photo"> => {
  const { photo: _photo, ...rest } = draft;

  return rest;
};

const readDraft = (): ReportDraft => {
  if (typeof window === "undefined") return DEFAULT_DRAFT;

  try {
    const stored = window.localStorage.getItem(DRAFT_KEY);
    if (!stored) return DEFAULT_DRAFT;

    return { ...DEFAULT_DRAFT, ...(JSON.parse(stored) as Partial<ReportDraft>) };
  } catch {
    return DEFAULT_DRAFT;
  }
};

const persistDraft = (draft: ReportDraft): void => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    try {
      // Mobile camera photos can exceed localStorage quotas. Keep the draft usable
      // by saving the text/location fields even when the photo cannot be persisted.
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(toStorageFallbackPayload(draft)));
    } catch {
      // Ignore storage failures so the in-memory draft still works.
    }
  }
};

/**
 * Manages the multi-step report draft without letting storage failures break the flow.
 *
 * Why: mobile camera photos can exceed localStorage limits, so draft persistence must
 * degrade safely instead of crashing the report screen.
 */
export const useReportDraft = () => {
  const [draft, setDraft] = useState<ReportDraft>(DEFAULT_DRAFT);

  useEffect(() => {
    setDraft(readDraft());
  }, []);

  const updateDraft = (next: Partial<ReportDraft>) => {
    setDraft((current) => {
      const updated = { ...current, ...next };
      persistDraft(updated);
      return updated;
    });
  };

  const clearDraft = () => {
    setDraft(DEFAULT_DRAFT);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(DRAFT_KEY);
    }
  };

  return { draft, updateDraft, clearDraft };
};
