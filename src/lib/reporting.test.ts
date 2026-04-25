import { describe, expect, it } from "vitest";
import { DEMO_REPORTS } from "@/lib/demoData";
import { buildFallbackStatusEvents, canResolveReport, getHomeTitle, getVisibleStatus } from "@/lib/reporting";

describe("reporting helpers", () => {
  it("maps internal statuses to simpler public statuses", () => {
    expect(getVisibleStatus("ai_reviewed")).toBe("reviewed");
    expect(getVisibleStatus("verified")).toBe("reviewed");
    expect(getVisibleStatus("scheduled")).toBe("in_progress");
    expect(getVisibleStatus("community_verified")).toBe("resolved");
  });

  it("requires proof or override reason before resolving", () => {
    expect(canResolveReport(undefined, undefined)).toBe(false);
    expect(canResolveReport("photo-data", undefined)).toBe(true);
    expect(canResolveReport(undefined, "Field photo pending")).toBe(true);
  });

  it("builds a readable fallback timeline for resolved reports", () => {
    const events = buildFallbackStatusEvents(DEMO_REPORTS[6]);
    expect(events.map((event) => event.status)).toContain("resolved");
    expect(events.at(-1)?.note).toContain("resolved");
  });

  it("uses a practical home title", () => {
    expect(getHomeTitle("Barangay Loyola Heights")).toBe("Road issues near Barangay Loyola Heights");
    expect(getHomeTitle()).toBe("Road issues near you");
  });
});
