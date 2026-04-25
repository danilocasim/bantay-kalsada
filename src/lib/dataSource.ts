import { formatDistanceToNow } from "date-fns";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { geohashForLocation } from "geofire-common";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import { isFirebaseConfigured, getBucket, getDb, getFirebaseAuth, ensureSignedInUser } from "./firebase";
import { DEMO_INSIGHT, DEMO_NOTIFICATIONS, DEMO_REPORTS } from "./demoData";
import { getUnresolvedDays, shouldShowEscalationSuggestion } from "./escalation";
import { buildFallbackStatusEvents, canResolveReport, getTimelineTitle } from "./reporting";
import { STATUS_LABEL, type IdentityStatus, type IdentityVerification, type Report, type ReportStatus, type StatusEvent } from "./types";

const REPORTS_KEY = "bk_reports_v1";
const IDENTITIES_KEY = "bk_identities_v1";
const INAPP_NOTIFY_PREFIX = "bk_inapp_notify_v1_";
const STATUS_SNAP_PREFIX = "bk_report_status_snap_";

type InAppNotificationRow = {
  id: string;
  title: string;
  body: string;
  reportId: string;
  at: string;
  unread: boolean;
};

function readInAppNotifications(uid: string): InAppNotificationRow[] {
  if (!hasStorage()) return [];
  try {
    const raw = window.localStorage.getItem(`${INAPP_NOTIFY_PREFIX}${uid}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as InAppNotificationRow[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeInAppNotifications(uid: string, items: InAppNotificationRow[]) {
  if (!hasStorage()) return;
  window.localStorage.setItem(`${INAPP_NOTIFY_PREFIX}${uid}`, JSON.stringify(items.slice(0, 40)));
}

/** Detect status transitions on the user’s own reports and queue in-app notifications (local storage). */
export function recordReportStatusNotifications(uid: string, reports: Report[]): void {
  if (!hasStorage()) return;
  const snapKey = `${STATUS_SNAP_PREFIX}${uid}`;
  let prev: Record<string, ReportStatus> = {};
  try {
    prev = JSON.parse(window.localStorage.getItem(snapKey) || "{}") as Record<string, ReportStatus>;
  } catch {
    prev = {};
  }

  const next: Record<string, ReportStatus> = { ...prev };
  const existing = readInAppNotifications(uid);
  const fresh: InAppNotificationRow[] = [];
  const atLabel = new Date().toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

  for (const r of reports) {
    const old = prev[r.id];
    if (old !== undefined && old !== r.status) {
      const id = `status-${r.id}-${r.status}-${r.updatedAtMs ?? Date.now()}`;
      if (!existing.some((e) => e.id === id) && !fresh.some((e) => e.id === id)) {
        fresh.push({
          id,
          title: `Status updated: ${STATUS_LABEL[r.status]}`,
          body: r.title,
          reportId: r.id,
          at: atLabel,
          unread: true,
        });
      }
    }
    next[r.id] = r.status;
  }

  window.localStorage.setItem(snapKey, JSON.stringify(next));
  if (fresh.length) writeInAppNotifications(uid, [...fresh, ...existing]);
}

export const DEMO_USER_ID = "demo-user";
export const DEMO_AGENCY_ID = "demo-mmda";
export const isDemoMode = !isFirebaseConfigured || import.meta.env.MODE === "test";

type CreateReportInput = {
  photoURL: string;
  coords: { lat: number; lng: number };
  category: Report["category"];
  description: string;
  title?: string;
};

type UpdateAgencyReportInput = {
  status: ReportStatus;
  note?: string;
  proofPhotoURL?: string;
  overrideReason?: string;
};

type ConfirmResult =
  | { ok: true; report: Report }
  | { ok: false; reason: "self" | "duplicate" | "missing" };

type ReportListener = (report: Report | null) => void;
type StatusEventsListener = (events: StatusEvent[]) => void;

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const hasStorage = (): boolean => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const nowLabel = (): string => "Just now";

const formatRelativeLabel = (value: unknown): string | undefined => {
  if (!value || typeof value !== "object" || !("toDate" in value) || typeof value.toDate !== "function") {
    return undefined;
  }

  const date = value.toDate() as Date;
  const diffMs = Date.now() - date.getTime();
  if (diffMs < 60_000) return "Just now";

  return formatDistanceToNow(date, { addSuffix: true })
    .replace(/^about /, "")
    .replace(" minutes", "m")
    .replace(" minute", "m")
    .replace(" hours", "h")
    .replace(" hour", "h")
    .replace(" days", "d")
    .replace(" day", "d");
};

const readReports = (): Report[] => {
  const base = DEMO_REPORTS.map((report) => ({
    ...clone(report),
    statusEvents: buildFallbackStatusEvents(report),
    confirmedBy: report.confirmedBy ?? [],
  }));

  if (!hasStorage()) return base;

  const stored = window.localStorage.getItem(REPORTS_KEY);
  if (!stored) {
    window.localStorage.setItem(REPORTS_KEY, JSON.stringify(base));
    return base;
  }

  try {
    return (JSON.parse(stored) as Report[]).map((report) => ({
      ...report,
      statusEvents: report.statusEvents?.length ? report.statusEvents : buildFallbackStatusEvents(report),
      confirmedBy: report.confirmedBy ?? [],
    }));
  } catch {
    window.localStorage.setItem(REPORTS_KEY, JSON.stringify(base));
    return base;
  }
};

const writeReports = (reports: Report[]): void => {
  if (!hasStorage()) return;
  window.localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
};

const defaultIdentity = (): IdentityVerification => ({ status: "unverified" });

const readIdentities = (): Record<string, IdentityVerification> => {
  if (!hasStorage()) return {};
  const stored = window.localStorage.getItem(IDENTITIES_KEY);
  if (!stored) return {};

  try {
    return JSON.parse(stored) as Record<string, IdentityVerification>;
  } catch {
    return {};
  }
};

const writeIdentities = (identities: Record<string, IdentityVerification>): void => {
  if (!hasStorage()) return;
  window.localStorage.setItem(IDENTITIES_KEY, JSON.stringify(identities));
};

const makeEvent = (reportId: string, status: ReportStatus, note: string) => ({
  id: `${reportId}-${status}-${Date.now()}`,
  status,
  atLabel: nowLabel(),
  note,
});

const withUpdatedReport = (reports: Report[], reportId: string, updater: (report: Report) => Report): Report[] =>
  reports.map((report) => (report.id === reportId ? updater(report) : report));

const toTitle = (category: Report["category"], description: string): string => {
  const prefix =
    category === "pothole"
      ? "Road damage reported"
      : category === "flood"
        ? "Flooded area reported"
        : category === "drainage"
          ? "Drainage issue reported"
          : category === "manhole"
            ? "Open manhole hazard reported"
            : "Road issue reported";

  const trimmed = description.trim();
  return trimmed ? `${prefix}: ${trimmed.slice(0, 48)}` : prefix;
};

const buildOptimisticReport = (base: Report, patch: Partial<Report>): Report => ({
  ...base,
  ...patch,
  confirmedBy: patch.confirmedBy ?? base.confirmedBy,
  statusEvents: patch.statusEvents ?? base.statusEvents,
});

const mapStatusEventSnapshot = (snapshot: QueryDocumentSnapshot<DocumentData>): StatusEvent => {
  const data = snapshot.data();
  const status = (data.status as ReportStatus | undefined) ?? "submitted";

  return {
    id: snapshot.id,
    status,
    atLabel: formatRelativeLabel(data.at) ?? "Recently",
    note: (data.note as string | undefined) ?? getTimelineTitle(status),
  };
};

const mapReportSnapshot = (
  snapshot: QueryDocumentSnapshot<DocumentData> | { id: string; data(): DocumentData },
  viewerUid?: string | null,
  viewerConfirmed = false,
): Report => {
  const data = snapshot.data();
  const createdAtLabel = formatRelativeLabel(data.createdAt);
  const updatedAtLabel = formatRelativeLabel(data.updatedAt) ?? createdAtLabel ?? "Recently";

  return {
    id: snapshot.id,
    title: (data.title as string | undefined) ?? "Road issue report",
    description: (data.description as string | undefined) ?? "",
    category: (data.category as Report["category"] | undefined) ?? "other",
    severity: (data.severity as Report["severity"] | undefined) ?? "moderate",
    status: (data.status as ReportStatus | undefined) ?? "submitted",
    geo: {
      lat: Number((data.geo as { lat?: number } | undefined)?.lat ?? 14.6),
      lng: Number((data.geo as { lng?: number } | undefined)?.lng ?? 121.03),
    },
    geohash: (data.geohash as string | undefined) ?? "",
    address: (data.address as string | undefined) ?? "Pinned location",
    barangay: (data.barangay as string | undefined) ?? "",
    city: (data.city as string | undefined) ?? "",
    agencyId: (data.agencyId as string | undefined) ?? undefined,
    agencyName: (data.agencyName as string | undefined) ?? undefined,
    reporterUid: (data.reporterUid as string | undefined) ?? DEMO_USER_ID,
    anonymous: Boolean(data.anonymous),
    photoURLs: Array.isArray(data.photoURLs) ? (data.photoURLs as string[]) : [],
    aiSummary: (data.aiSummary as string | undefined) ?? undefined,
    aiCategory: (data.aiCategory as Report["category"] | undefined) ?? undefined,
    aiSeverity: (data.aiSeverity as Report["severity"] | undefined) ?? undefined,
    aiOfficialReport: (data.aiOfficialReport as string | undefined) ?? undefined,
    routingConfidence: typeof data.routingConfidence === "number" ? data.routingConfidence : undefined,
    confirmCount: Number(data.confirmCount ?? 0),
    urgencyScore: Number(data.urgencyScore ?? 0),
    updatedLabel: updatedAtLabel,
    createdAtMs: typeof data.createdAt?.toMillis === "function" ? data.createdAt.toMillis() : undefined,
    updatedAtMs: typeof data.updatedAt?.toMillis === "function" ? data.updatedAt.toMillis() : undefined,
    resolutionProof:
      data.resolutionProof && typeof data.resolutionProof === "object"
        ? {
            photoURL: (data.resolutionProof.photoURL as string | undefined) ?? undefined,
            uploadedBy: (data.resolutionProof.uploadedBy as string | undefined) ?? undefined,
            uploadedAtLabel: formatRelativeLabel(data.resolutionProof.uploadedAt) ?? (data.resolutionProof.uploadedAtLabel as string | undefined),
            overrideReason: (data.resolutionProof.overrideReason as string | undefined) ?? undefined,
          }
        : undefined,
    confirmedBy: viewerUid && viewerConfirmed ? [viewerUid] : [],
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
};

const getViewerUid = (): string | null => getFirebaseAuth().currentUser?.uid ?? null;

const getReportRef = (reportId: string) => doc(getDb(), "reports", reportId);

const ensureLiveUid = async (uid?: string): Promise<string> => {
  if (uid) return uid;
  const user = await ensureSignedInUser();
  if (!user) throw new Error("Sign-in is required to continue.");
  return user.uid;
};

const uploadDataUrl = async (path: string, dataUrl: string): Promise<string> => {
  const uploadRef = ref(getBucket(), path);
  await uploadString(uploadRef, dataUrl, "data_url");
  return getDownloadURL(uploadRef);
};

export const getCurrentUserId = (): string => getViewerUid() ?? DEMO_USER_ID;

export async function listReports(): Promise<Report[]> {
  if (isDemoMode) return readReports().sort((a, b) => b.urgencyScore - a.urgencyScore);

  const reportsQuery = query(collection(getDb(), "reports"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(reportsQuery);
  return snapshot.docs.map((report) => mapReportSnapshot(report));
}

export async function getReport(id: string): Promise<Report | null> {
  if (isDemoMode) return readReports().find((report) => report.id === id) ?? null;

  const snapshot = await getDoc(getReportRef(id));
  if (!snapshot.exists()) return null;

  const viewerUid = getViewerUid();
  const confirmed = viewerUid
    ? (await getDoc(doc(getDb(), "reports", id, "confirmations", viewerUid))).exists()
    : false;

  return mapReportSnapshot(snapshot, viewerUid, confirmed);
}

export async function listMyReports(uid: string): Promise<Report[]> {
  let reports: Report[];
  if (isDemoMode) {
    reports = readReports().filter((report) => report.reporterUid === uid);
  } else {
    const reportsQuery = query(collection(getDb(), "reports"), where("reporterUid", "==", uid), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(reportsQuery);
    reports = snapshot.docs.map((report) => mapReportSnapshot(report, uid));
  }
  recordReportStatusNotifications(uid, reports);
  return reports;
}

export async function listAgencyReports(agencyId: string): Promise<Report[]> {
  if (isDemoMode) return readReports().filter((report) => (agencyId ? report.agencyId === agencyId : Boolean(report.agencyId)));
  if (!agencyId) return [];

  const reportsQuery = query(collection(getDb(), "reports"), where("agencyId", "==", agencyId));
  const snapshot = await getDocs(reportsQuery);
  return snapshot.docs.map((report) => mapReportSnapshot(report));
}

export async function createReport(input: CreateReportInput): Promise<Report> {
  if (isDemoMode) {
    const reports = readReports();
    const id = `report-${Date.now()}`;
    const report: Report = {
      id,
      title: input.title?.trim() || toTitle(input.category, input.description),
      description: input.description.trim(),
      category: input.category,
      severity: input.category === "manhole" || input.category === "flood" ? "high" : "moderate",
      status: "submitted",
      geo: input.coords,
      geohash: `${input.coords.lat.toFixed(2)}:${input.coords.lng.toFixed(2)}`,
      address: "Pinned location from report",
      barangay: "Pending barangay",
      city: "Pilot area",
      reporterUid: DEMO_USER_ID,
      anonymous: false,
      photoURLs: [input.photoURL],
      confirmCount: 0,
      urgencyScore: input.category === "flood" || input.category === "manhole" ? 85 : 60,
      updatedLabel: nowLabel(),
      statusEvents: [makeEvent(id, "submitted", "Report received from the community.")],
      confirmedBy: [],
    };

    writeReports([report, ...reports]);
    return report;
  }

  const user = await ensureSignedInUser();
  if (!user) throw new Error("Sign-in is required before submitting a report.");

  const reportRef = doc(collection(getDb(), "reports"));
  const photoURL = await uploadDataUrl(`reports/${reportRef.id}/report-${Date.now()}.jpg`, input.photoURL);

  const reportData = {
    title: input.title?.trim() || toTitle(input.category, input.description),
    description: input.description.trim(),
    category: input.category,
    severity: input.category === "manhole" || input.category === "flood" ? "high" : "moderate",
    status: "submitted",
    geo: input.coords,
    geohash: geohashForLocation([input.coords.lat, input.coords.lng]),
    address: "Pinned location from report",
    barangay: "Pending barangay",
    city: "Pilot area",
    reporterUid: user.uid,
    anonymous: user.isAnonymous,
    photoURLs: [photoURL],
    confirmCount: 0,
    urgencyScore: input.category === "flood" || input.category === "manhole" ? 85 : 60,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(reportRef, reportData);

  return {
    id: reportRef.id,
    title: reportData.title,
    description: reportData.description,
    category: reportData.category,
    severity: reportData.severity,
    status: reportData.status,
    geo: reportData.geo,
    geohash: reportData.geohash,
    address: reportData.address,
    barangay: reportData.barangay,
    city: reportData.city,
    reporterUid: reportData.reporterUid,
    anonymous: reportData.anonymous,
    photoURLs: reportData.photoURLs,
    confirmCount: reportData.confirmCount,
    urgencyScore: reportData.urgencyScore,
    updatedLabel: nowLabel(),
    confirmedBy: [],
  };
}

export async function confirmReport(reportId: string, uid?: string): Promise<ConfirmResult> {
  if (isDemoMode) {
    const reports = readReports();
    const report = reports.find((item) => item.id === reportId);
    const viewerUid = uid ?? DEMO_USER_ID;
    if (!report) return { ok: false, reason: "missing" };
    if (report.reporterUid === viewerUid) return { ok: false, reason: "self" };
    if (report.confirmedBy?.includes(viewerUid)) return { ok: false, reason: "duplicate" };

    const updatedReport: Report = {
      ...report,
      confirmCount: report.confirmCount + 1,
      confirmedBy: [...(report.confirmedBy ?? []), viewerUid],
      updatedLabel: nowLabel(),
    };

    writeReports(withUpdatedReport(reports, reportId, () => updatedReport));
    return { ok: true, report: updatedReport };
  }

  const viewerUid = await ensureLiveUid(uid);
  const reportRef = getReportRef(reportId);
  const confirmationRef = doc(getDb(), "reports", reportId, "confirmations", viewerUid);

  const reportSnapshot = await getDoc(reportRef);
  if (!reportSnapshot.exists()) return { ok: false, reason: "missing" };

  const report = mapReportSnapshot(reportSnapshot, viewerUid);
  if (report.reporterUid === viewerUid) return { ok: false, reason: "self" };
  if ((await getDoc(confirmationRef)).exists()) return { ok: false, reason: "duplicate" };

  await runTransaction(getDb(), async (transaction) => {
    const liveReport = await transaction.get(reportRef);
    if (!liveReport.exists()) throw new Error("missing");

    const liveConfirmation = await transaction.get(confirmationRef);
    if (liveConfirmation.exists()) throw new Error("duplicate");

    const currentCount = Number(liveReport.data().confirmCount ?? 0);
    transaction.set(confirmationRef, { uid: viewerUid, createdAt: serverTimestamp() });
    transaction.update(reportRef, { confirmCount: currentCount + 1, updatedAt: serverTimestamp() });
  }).catch((error: Error) => {
    if (error.message === "duplicate") throw Object.assign(new Error("duplicate"), { code: "duplicate" });
    if (error.message === "missing") throw Object.assign(new Error("missing"), { code: "missing" });
    throw error;
  });

  return {
    ok: true,
    report: buildOptimisticReport(report, {
      confirmCount: report.confirmCount + 1,
      confirmedBy: [viewerUid],
      updatedLabel: nowLabel(),
    }),
  };
}

export async function reopenReport(reportId: string): Promise<Report | null> {
  if (isDemoMode) {
    const reports = readReports();
    const report = reports.find((item) => item.id === reportId);
    if (!report) return null;

    const event = makeEvent(reportId, "reopened", "Community reported that the issue is still unresolved.");
    const updatedReport: Report = {
      ...report,
      status: "reopened",
      updatedLabel: nowLabel(),
      statusEvents: [...buildFallbackStatusEvents(report), event],
    };

    writeReports(withUpdatedReport(reports, reportId, () => updatedReport));
    return updatedReport;
  }

  const reportRef = getReportRef(reportId);
  const snapshot = await getDoc(reportRef);
  if (!snapshot.exists()) return null;

  await updateDoc(reportRef, { status: "reopened", updatedAt: serverTimestamp() });
  return getReport(reportId);
}

export async function updateAgencyReport(reportId: string, input: UpdateAgencyReportInput): Promise<Report> {
  if (isDemoMode) {
    const reports = readReports();
    const report = reports.find((item) => item.id === reportId);

    if (!report) {
      throw new Error("Case not found.");
    }

    if (input.status === "resolved" && !canResolveReport(input.proofPhotoURL, input.overrideReason)) {
      throw new Error("Resolution requires a proof photo or an override reason.");
    }

    const note = getTimelineTitle(input.status);
    const statusEvents = [...buildFallbackStatusEvents(report), makeEvent(reportId, input.status, note)];

    const updatedReport: Report = {
      ...report,
      status: input.status,
      updatedLabel: nowLabel(),
      statusEvents,
      resolutionProof:
        input.status === "resolved"
          ? {
              photoURL: input.proofPhotoURL,
              uploadedBy: report.agencyName ?? "Handling team",
              uploadedAtLabel: nowLabel(),
              overrideReason: input.overrideReason?.trim(),
            }
          : report.resolutionProof,
    };

    writeReports(withUpdatedReport(reports, reportId, () => updatedReport));
    return updatedReport;
  }

  const reportRef = getReportRef(reportId);
  const snapshot = await getDoc(reportRef);
  if (!snapshot.exists()) {
    throw new Error("Case not found.");
  }

  const report = mapReportSnapshot(snapshot);
  if (input.status === "resolved" && !canResolveReport(input.proofPhotoURL, input.overrideReason)) {
    throw new Error("Resolution requires a proof photo or an override reason.");
  }

  let resolutionProof = report.resolutionProof;
  if (input.status === "resolved") {
    const uploadedProof = input.proofPhotoURL
      ? await uploadDataUrl(`reports/${reportId}/proof/proof-${Date.now()}.jpg`, input.proofPhotoURL)
      : undefined;

    resolutionProof = {
      photoURL: uploadedProof,
      uploadedBy: report.agencyName ?? "Handling team",
      overrideReason: input.overrideReason?.trim(),
      uploadedAtLabel: nowLabel(),
    };
  }

  await updateDoc(reportRef, {
    status: input.status,
    updatedAt: serverTimestamp(),
    ...(input.status === "resolved"
      ? {
          resolutionProof: {
            photoURL: resolutionProof?.photoURL,
            uploadedBy: resolutionProof?.uploadedBy,
            overrideReason: resolutionProof?.overrideReason,
            uploadedAt: serverTimestamp(),
          },
        }
      : {}),
  });

  return (await getReport(reportId)) ?? buildOptimisticReport(report, { status: input.status, resolutionProof });
}

export async function listStatusEvents(reportId: string): Promise<StatusEvent[]> {
  if (isDemoMode) {
    const report = await getReport(reportId);
    return report ? buildFallbackStatusEvents(report) : [];
  }

  const eventsQuery = query(collection(getDb(), "reports", reportId, "statusEvents"), orderBy("at", "asc"));
  const snapshot = await getDocs(eventsQuery);
  if (!snapshot.docs.length) {
    const report = await getReport(reportId);
    return report ? buildFallbackStatusEvents(report) : [];
  }
  return snapshot.docs.map(mapStatusEventSnapshot);
}

export function subscribeReport(reportId: string, onReport: ReportListener): () => void {
  if (isDemoMode) {
    void getReport(reportId).then(onReport);
    return () => undefined;
  }

  const reportRef = getReportRef(reportId);
  return onSnapshot(reportRef, async (snapshot) => {
    if (!snapshot.exists()) {
      onReport(null);
      return;
    }

    const viewerUid = getViewerUid();
    const confirmed = viewerUid
      ? (await getDoc(doc(getDb(), "reports", reportId, "confirmations", viewerUid))).exists()
      : false;

    onReport(mapReportSnapshot(snapshot, viewerUid, confirmed));
  });
}

export function subscribeStatusEvents(reportId: string, onEvents: StatusEventsListener): () => void {
  if (isDemoMode) {
    void listStatusEvents(reportId).then(onEvents);
    return () => undefined;
  }

  const eventsQuery = query(collection(getDb(), "reports", reportId, "statusEvents"), orderBy("at", "asc"));
  return onSnapshot(eventsQuery, async (snapshot) => {
    if (!snapshot.docs.length) {
      onEvents(await listStatusEvents(reportId));
      return;
    }
    onEvents(snapshot.docs.map(mapStatusEventSnapshot));
  });
}

export async function listNotifications(_uid: string) {
  const buildEscalationNotifications = (reports: Report[]) =>
    reports
      .filter((report) => shouldShowEscalationSuggestion(report, _uid))
      .map((report) => ({
        id: `escalation-${report.id}`,
        title: "This report is still unresolved after 20 days",
        body: `Would you like to prepare an escalation email to 8888 for ${report.title}?`,
        reportId: report.id,
        at: `${getUnresolvedDays(report) ?? 20}d unresolved`,
        unread: true,
      }));

  if (!isDemoMode) {
    const reports = await listMyReports(_uid);
    const inApp = readInAppNotifications(_uid);
    const reportNotifications = reports
      .sort((a, b) => (b.updatedAtMs ?? 0) - (a.updatedAtMs ?? 0))
      .slice(0, 8)
      .map((report) => ({
        id: `report-${report.id}`,
        title: `Report update: ${STATUS_LABEL[report.status]}`,
        body: report.title,
        reportId: report.id,
        at: report.updatedLabel ?? "Recently",
        unread: false,
      }));

    return [...inApp, ...buildEscalationNotifications(reports), ...reportNotifications];
  }

  const demoReports = readReports().filter((report) => report.reporterUid === _uid);
  recordReportStatusNotifications(_uid, demoReports);
  const inApp = readInAppNotifications(_uid);
  return [...inApp, ...buildEscalationNotifications(demoReports), ...DEMO_NOTIFICATIONS];
}

export async function getHomeInsight(_geohash?: string) {
  if (!isDemoMode) {
    const reports = await listReports();
    const activeReports = reports.filter((report) => !["resolved", "community_verified"].includes(report.status));
    const highPriority = activeReports.filter((report) => report.severity === "high").length;
    const area = activeReports[0]?.city ?? reports[0]?.city ?? "your area";

    return {
      area,
      summary:
        highPriority > 0
          ? `${highPriority} high-priority road hazards are still active near ${area}. Review the latest reports before travelling.`
          : `No high-priority road hazards are currently active near ${area}.`,
      trend: highPriority > 0 ? ("up" as const) : ("steady" as const),
    };
  }
  return DEMO_INSIGHT;
}

export async function getIdentityVerification(uid: string): Promise<IdentityVerification> {
  return readIdentities()[uid] ?? defaultIdentity();
}

export async function submitIdentityVerification(
  uid: string,
  input: { idImageURL: string; selfieImageURL: string },
): Promise<IdentityVerification> {
  const identities = readIdentities();
  const next: IdentityVerification = {
    status: "pending_review",
    submittedAtLabel: nowLabel(),
    idImageURL: input.idImageURL,
    selfieImageURL: input.selfieImageURL,
  };

  identities[uid] = next;
  writeIdentities(identities);
  return next;
}

export async function reviewIdentityVerification(
  uid: string,
  status: Extract<IdentityStatus, "verified" | "rejected">,
  reviewReason?: string,
): Promise<IdentityVerification> {
  const identities = readIdentities();
  const next: IdentityVerification = {
    ...(identities[uid] ?? defaultIdentity()),
    status,
    reviewedAtLabel: nowLabel(),
    reviewReason: reviewReason?.trim(),
  };

  identities[uid] = next;
  writeIdentities(identities);
  return next;
}

export async function listIdentityVerifications(): Promise<Array<{ uid: string; verification: IdentityVerification }>> {
  return Object.entries(readIdentities()).map(([uid, verification]) => ({ uid, verification }));
}

export function resetLocalDemoState(): void {
  if (!hasStorage()) return;
  window.localStorage.removeItem(REPORTS_KEY);
  window.localStorage.removeItem(IDENTITIES_KEY);
  for (let i = window.localStorage.length - 1; i >= 0; i--) {
    const k = window.localStorage.key(i);
    if (!k) continue;
    if (k.startsWith(INAPP_NOTIFY_PREFIX) || k.startsWith(STATUS_SNAP_PREFIX)) window.localStorage.removeItem(k);
  }
}
