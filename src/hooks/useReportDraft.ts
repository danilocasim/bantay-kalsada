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

const readDraft = (): ReportDraft => {
  if (typeof window === "undefined") return DEFAULT_DRAFT;
  const stored = window.localStorage.getItem(DRAFT_KEY);
  if (!stored) return DEFAULT_DRAFT;

  try {
    return { ...DEFAULT_DRAFT, ...(JSON.parse(stored) as Partial<ReportDraft>) };
  } catch {
    return DEFAULT_DRAFT;
  }
};

export const useReportDraft = () => {
  const [draft, setDraft] = useState<ReportDraft>(DEFAULT_DRAFT);

  useEffect(() => {
    setDraft(readDraft());
  }, []);

  const updateDraft = (next: Partial<ReportDraft>) => {
    setDraft((current) => {
      const updated = { ...current, ...next };
      if (typeof window !== "undefined") {
        window.localStorage.setItem(DRAFT_KEY, JSON.stringify(updated));
      }
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
