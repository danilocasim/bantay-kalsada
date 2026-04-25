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

export const PRIMARY_CATEGORY_OPTIONS: Category[] = ["pothole", "flood", "drainage", "manhole"];

export const SECONDARY_CATEGORY_OPTIONS: Category[] = ["sign", "obstruction", "other"];

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

export type VisibleReportStatus =
  | "submitted"
  | "reviewed"
  | "routed"
  | "acknowledged"
  | "in_progress"
  | "resolved"
  | "reopened";

export const STATUS_LABEL: Record<ReportStatus, string> = {
  submitted: "Submitted",
  ai_reviewed: "Reviewed",
  verified: "Reviewed",
  routed: "Routed",
  acknowledged: "Acknowledged",
  scheduled: "In Progress",
  in_progress: "In progress",
  resolved: "Resolved",
  community_verified: "Resolved",
  reopened: "Reopened",
};

export const STATUS_DESCRIPTION: Record<ReportStatus, string> = {
  submitted: "Report received and waiting for review.",
  ai_reviewed: "Reviewed and categorized.",
  verified: "Reviewed and verified.",
  routed: "Sent to the likely office.",
  acknowledged: "Agency confirmed receipt.",
  scheduled: "Work is being prepared.",
  in_progress: "Repair or field work is underway.",
  resolved: "Marked fixed by the handling team.",
  community_verified: "Residents confirmed the issue is fixed.",
  reopened: "Community reported the issue is still unresolved.",
};

export type StatusEvent = {
  id: string;
  status: ReportStatus;
  atLabel: string;
  note: string;
};

export type ResolutionProof = {
  photoURL?: string;
  uploadedBy?: string;
  uploadedAtLabel?: string;
  overrideReason?: string;
};

export type IdentityStatus = "unverified" | "pending_review" | "verified" | "rejected";

export type IdentityVerification = {
  status: IdentityStatus;
  submittedAtLabel?: string;
  reviewedAtLabel?: string;
  reviewReason?: string;
  idImageURL?: string;
  selfieImageURL?: string;
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
  routingConfidence?: number;
  confirmCount: number;
  urgencyScore: number;
  updatedLabel?: string;
  createdAtMs?: number;
  updatedAtMs?: number;
  statusEvents?: StatusEvent[];
  resolutionProof?: ResolutionProof;
  confirmedBy?: string[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};
