import { beforeEach, describe, expect, it } from "vitest";
import {
  buildEscalationMailto,
  dismissEscalationSuggestion,
  getEscalationActionState,
  getUnresolvedDays,
  isEscalationEligible,
  markEscalationPrepared,
  resetEscalationState,
  shouldShowEscalationSuggestion,
} from "@/lib/escalation";
import type { Report } from "@/lib/types";

const oldUnresolvedReport: Pick<Report, "id" | "title" | "category" | "address" | "status" | "agencyName" | "aiSummary" | "createdAtMs" | "reporterUid"> = {
  id: "report-8888",
  title: "Deep pothole near school gate",
  category: "pothole",
  address: "Aurora Blvd, Quezon City",
  status: "acknowledged",
  agencyName: "DPWH NCR",
  aiSummary: "Severe pothole on a high-traffic lane.",
  createdAtMs: Date.now() - 21 * 24 * 60 * 60 * 1000,
  reporterUid: "demo-user",
};

describe("escalation helpers", () => {
  beforeEach(() => {
    resetEscalationState();
  });

  it("marks a report eligible after 20 unresolved days for the original reporter", () => {
    expect(getUnresolvedDays(oldUnresolvedReport)).toBeGreaterThanOrEqual(21);
    expect(isEscalationEligible(oldUnresolvedReport, "demo-user")).toBe(true);
    expect(isEscalationEligible(oldUnresolvedReport, "another-user")).toBe(false);
  });

  it("hides the escalation suggestion after dismiss or prepare actions", () => {
    expect(shouldShowEscalationSuggestion(oldUnresolvedReport, "demo-user")).toBe(true);

    dismissEscalationSuggestion(oldUnresolvedReport.id);
    expect(getEscalationActionState(oldUnresolvedReport.id)).toBe("dismissed");
    expect(shouldShowEscalationSuggestion(oldUnresolvedReport, "demo-user")).toBe(false);

    resetEscalationState();
    markEscalationPrepared(oldUnresolvedReport.id);
    expect(getEscalationActionState(oldUnresolvedReport.id)).toBe("prepared");
    expect(shouldShowEscalationSuggestion(oldUnresolvedReport, "demo-user")).toBe(false);
  });

  it("builds a prefilled escalation mail draft", () => {
    const mailto = buildEscalationMailto(oldUnresolvedReport, "https://bantay.test");

    expect(mailto).toContain("mailto:");
    expect(mailto).toContain(encodeURIComponent(oldUnresolvedReport.id));
    expect(mailto).toContain(encodeURIComponent("Tracking page: https://bantay.test/r/report-8888"));
  });
});
