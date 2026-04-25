import type { Timestamp } from "firebase/firestore";

export type Category =
  | "pothole"
  | "flood"
  | "drainage"
  | "manhole"
  | "sign"
  | "obstruction"
  | "other";

export const CATEGORY_LABEL: Record<Category, string> = {
  pothole: "Pothole",
  flood: "Flooded Area",
  drainage: "Damaged Drainage",
  manhole: "Open Manhole",
  sign: "Broken Road Sign",
  obstruction: "Road Obstruction",
  other: "Other",
};

export const CATEGORY_COLOR: Record<Category, string> = {
  pothole: "hsl(var(--status-pothole))",
  flood: "hsl(var(--status-flood))",
  drainage: "hsl(var(--status-drainage))",
  manhole: "hsl(var(--status-urgent))",
  sign: "hsl(var(--status-pending))",
  obstruction: "hsl(var(--status-urgent))",
  other: "hsl(var(--status-pending))",
};

export type Severity = "low" | "moderate" | "high";

export type ReportStatus =
  | "submitted"
  | "ai_reviewed"
  | "verified"
  | "routed"
  | "acknowledged"
  | "scheduled"
  | "in_progress"
  | "resolved"
  | "community_verified"
  | "reopened";

export const STATUS_LABEL: Record<ReportStatus, string> = {
  submitted: "Submitted",
  ai_reviewed: "AI Reviewed",
  verified: "Verified",
  routed: "Routed",
  acknowledged: "Acknowledged",
  scheduled: "Scheduled",
  in_progress: "In Progress",
  resolved: "Resolved",
  community_verified: "Community Verified",
  reopened: "Reopened",
};

export type Report = {
  id: string;
  title: string;
  description: string;
  category: Category;
  severity: Severity;
  status: ReportStatus;
  geo: { lat: number; lng: number };
  geohash: string;
  address?: string;
  barangay?: string;
  city?: string;
  agencyId?: string;
  agencyName?: string;
  reporterUid: string;
  anonymous: boolean;
  photoURLs: string[];
  aiSummary?: string;
  aiCategory?: Category;
  aiSeverity?: Severity;
  aiOfficialReport?: string;
  confirmCount: number;
  urgencyScore: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};