import type { Report, ReportStatus, StatusEvent, VisibleReportStatus } from "./types";

const STATUS_VISIBILITY: Record<ReportStatus, VisibleReportStatus> = {
  submitted: "submitted",
  ai_reviewed: "reviewed",
  verified: "reviewed",
  routed: "routed",
  acknowledged: "acknowledged",
  scheduled: "in_progress",
  in_progress: "in_progress",
  resolved: "resolved",
  community_verified: "resolved",
  reopened: "reopened",
};

const TIMELINE_TITLE: Record<ReportStatus, string> = {
  submitted: "Report received",
  ai_reviewed: "Reviewed and categorized",
  verified: "Reviewed and verified",
  routed: "Routed to the likely office",
  acknowledged: "Acknowledged by agency",
  scheduled: "Work scheduled",
  in_progress: "Repair in progress",
  resolved: "Marked resolved",
  community_verified: "Community verified the fix",
  reopened: "Reopened by community",
};

export const getVisibleStatus = (status: ReportStatus): VisibleReportStatus => STATUS_VISIBILITY[status];

export const getTimelineTitle = (status: ReportStatus): string => TIMELINE_TITLE[status];

export const canResolveReport = (proofPhotoURL?: string, overrideReason?: string): boolean =>
  Boolean(proofPhotoURL || overrideReason?.trim());

export const buildFallbackStatusEvents = (report: Report): StatusEvent[] => {
  if (report.statusEvents?.length) return report.statusEvents;

  const hasReviewStep = report.status !== "submitted";
  const reviewStatus: ReportStatus = hasReviewStep ? (report.status === "verified" ? "verified" : "ai_reviewed") : "submitted";
  const reviewNote = report.aiSummary
    ? `Reviewed as ${report.category.replace("_", " ")}.`
    : "Report details were reviewed and categorized.";

  const events: StatusEvent[] = [
    {
      id: `${report.id}-submitted`,
      status: "submitted",
      atLabel: report.updatedLabel ?? "Recently",
      note: "Report received from the community.",
    },
  ];

  if (hasReviewStep) {
    events.push({
      id: `${report.id}-reviewed`,
      status: reviewStatus,
      atLabel: report.updatedLabel ?? "Recently",
      note: reviewNote,
    });
  }

  if (["routed", "acknowledged", "scheduled", "in_progress", "resolved", "community_verified", "reopened"].includes(report.status)) {
    events.push({
      id: `${report.id}-routed`,
      status: "routed",
      atLabel: report.updatedLabel ?? "Recently",
      note: `Sent to ${report.agencyName ?? "the likely office"}.`,
    });
  }

  if (["acknowledged", "scheduled", "in_progress", "resolved", "community_verified", "reopened"].includes(report.status)) {
    events.push({
      id: `${report.id}-acknowledged`,
      status: "acknowledged",
      atLabel: report.updatedLabel ?? "Recently",
      note: `${report.agencyName ?? "Agency"} confirmed receipt.`,
    });
  }

  if (["scheduled", "in_progress"].includes(report.status)) {
    events.push({
      id: `${report.id}-progress`,
      status: report.status,
      atLabel: report.updatedLabel ?? "Recently",
      note: report.status === "scheduled" ? "Work has been scheduled." : "Repair or field work is underway.",
    });
  }

  if (["resolved", "community_verified", "reopened"].includes(report.status)) {
    events.push({
      id: `${report.id}-resolved`,
      status: "resolved",
      atLabel: report.resolutionProof?.uploadedAtLabel ?? report.updatedLabel ?? "Recently",
      note: report.resolutionProof?.overrideReason
        ? `Resolved with manual override: ${report.resolutionProof.overrideReason}`
        : `Resolved by ${report.resolutionProof?.uploadedBy ?? report.agencyName ?? "the handling team"}.`,
    });
  }

  if (report.status === "community_verified") {
    events.push({
      id: `${report.id}-community-verified`,
      status: "community_verified",
      atLabel: report.updatedLabel ?? "Recently",
      note: "Residents confirmed the issue is fixed.",
    });
  }

  if (report.status === "reopened") {
    events.push({
      id: `${report.id}-reopened`,
      status: "reopened",
      atLabel: report.updatedLabel ?? "Recently",
      note: "Community reported that the issue is still unresolved.",
    });
  }

  return events;
};

export const getHomeTitle = (area?: string): string =>
  area?.trim() ? `Road issues near ${area}` : "Road issues near you";
