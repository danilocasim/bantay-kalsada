import { CATEGORY_LABEL, STATUS_LABEL, type Report } from "@/lib/types";

const ESCALATION_KEY = "bk_escalation_state_v1";
const TWENTY_DAYS_MS = 20 * 24 * 60 * 60 * 1000;
const RESOLVED_STATUSES = new Set(["resolved", "community_verified"]);

export const GOV_8888_EMAIL = (import.meta.env.VITE_8888_EMAIL as string | undefined)?.trim() ?? "";

type EscalationState = Record<string, { dismissedAt?: number; preparedAt?: number }>;

type EscalationActionState = "none" | "dismissed" | "prepared";

const hasStorage = (): boolean => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const readEscalationState = (): EscalationState => {
  if (!hasStorage()) return {};

  const raw = window.localStorage.getItem(ESCALATION_KEY);
  if (!raw) return {};

  try {
    return JSON.parse(raw) as EscalationState;
  } catch {
    return {};
  }
};

const writeEscalationState = (state: EscalationState) => {
  if (!hasStorage()) return;
  window.localStorage.setItem(ESCALATION_KEY, JSON.stringify(state));
};

const getCreatedAtMs = (report: Pick<Report, "createdAtMs" | "createdAt">): number | null => {
  if (typeof report.createdAtMs === "number") return report.createdAtMs;
  if (report.createdAt && typeof report.createdAt.toMillis === "function") return report.createdAt.toMillis();
  return null;
};

export function getEscalationActionState(reportId: string): EscalationActionState {
  const state = readEscalationState()[reportId];
  if (!state) return "none";
  if (state.preparedAt) return "prepared";
  if (state.dismissedAt) return "dismissed";
  return "none";
}

export function dismissEscalationSuggestion(reportId: string) {
  const state = readEscalationState();
  state[reportId] = { ...state[reportId], dismissedAt: Date.now() };
  writeEscalationState(state);
}

export function markEscalationPrepared(reportId: string) {
  const state = readEscalationState();
  state[reportId] = { ...state[reportId], preparedAt: Date.now() };
  writeEscalationState(state);
}

export function getUnresolvedDays(report: Pick<Report, "createdAtMs" | "createdAt">, now = Date.now()): number | null {
  const createdAtMs = getCreatedAtMs(report);
  if (!createdAtMs) return null;
  return Math.floor((now - createdAtMs) / (24 * 60 * 60 * 1000));
}

export function isEscalationEligible(report: Pick<Report, "id" | "status" | "reporterUid" | "createdAtMs" | "createdAt">, viewerUid: string, now = Date.now()): boolean {
  if (report.reporterUid !== viewerUid) return false;
  if (RESOLVED_STATUSES.has(report.status)) return false;
  const createdAtMs = getCreatedAtMs(report);
  if (!createdAtMs) return false;
  return now - createdAtMs >= TWENTY_DAYS_MS;
}

export function shouldShowEscalationSuggestion(report: Pick<Report, "id" | "status" | "reporterUid" | "createdAtMs" | "createdAt">, viewerUid: string): boolean {
  if (!isEscalationEligible(report, viewerUid)) return false;
  return getEscalationActionState(report.id) === "none";
}

export function buildEscalationMailto(report: Pick<Report, "id" | "title" | "category" | "address" | "status" | "agencyName" | "aiSummary" | "createdAtMs" | "createdAt">, origin?: string): string {
  const reportedOn = getCreatedAtMs(report);
  const reportedDate = reportedOn ? new Date(reportedOn).toLocaleDateString() : "Unknown date";
  const subject = `Escalation request: unresolved road issue report ${report.id}`;
  const body = [
    "Hello 8888 Complaint Center,",
    "",
    "I would like to escalate a road issue report that remains unresolved after 20 days.",
    "",
    `Report ID: ${report.id}`,
    `Title: ${report.title}`,
    `Category: ${CATEGORY_LABEL[report.category]}`,
    `Location: ${report.address ?? "Pinned location"}`,
    `Date reported: ${reportedDate}`,
    `Current status: ${STATUS_LABEL[report.status]}`,
    `Likely office: ${report.agencyName ?? "Not yet assigned"}`,
    report.aiSummary ? `Summary: ${report.aiSummary}` : undefined,
    origin ? `Tracking page: ${origin}/r/${report.id}` : undefined,
    "",
    "Please help follow up with the concerned office.",
    "",
    "Thank you.",
  ]
    .filter(Boolean)
    .join("\n");

  const recipient = GOV_8888_EMAIL ? encodeURIComponent(GOV_8888_EMAIL) : "";
  return `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function resetEscalationState(): void {
  if (!hasStorage()) return;
  window.localStorage.removeItem(ESCALATION_KEY);
}
