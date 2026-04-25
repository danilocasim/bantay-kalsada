import { isFirebaseConfigured } from "./firebase";
import { DEMO_REPORTS, DEMO_NOTIFICATIONS, DEMO_INSIGHT } from "./demoData";
import type { Report } from "./types";

export const isDemoMode = !isFirebaseConfigured;

/** Returns all reports. In demo mode → seed data. With Firebase → live Firestore (TODO wire). */
export async function listReports(): Promise<Report[]> {
  if (isDemoMode) return DEMO_REPORTS;
  // TODO: const snap = await getDocs(query(collection(getDb(), "reports"), orderBy("createdAt", "desc")));
  return DEMO_REPORTS;
}

export async function getReport(id: string): Promise<Report | null> {
  if (isDemoMode) return DEMO_REPORTS.find((r) => r.id === id) ?? null;
  return DEMO_REPORTS.find((r) => r.id === id) ?? null;
}

export async function listMyReports(uid: string): Promise<Report[]> {
  if (isDemoMode) return DEMO_REPORTS.filter((r) => r.reporterUid === "demo-user");
  return DEMO_REPORTS.filter((r) => r.reporterUid === uid);
}

export async function listAgencyReports(agencyId: string): Promise<Report[]> {
  if (isDemoMode) return DEMO_REPORTS.filter((r) => r.agencyId);
  return DEMO_REPORTS.filter((r) => r.agencyId === agencyId);
}

export async function listNotifications(_uid: string) {
  return DEMO_NOTIFICATIONS;
}

export async function getHomeInsight(_geohash?: string) {
  return DEMO_INSIGHT;
}