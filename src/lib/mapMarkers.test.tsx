import { describe, expect, it } from "vitest";
import { createReportMarkerIcon, getMapCategoryIconLabel, getMapSeverityRingColor } from "@/lib/mapMarkers";

describe("map marker helpers", () => {
  it("maps report categories to meaningful icon labels", () => {
    expect(getMapCategoryIconLabel("flood")).toBe("Waves");
    expect(getMapCategoryIconLabel("sign")).toBe("Signpost");
    expect(getMapCategoryIconLabel("obstruction")).toBe("Traffic cone");
  });

  it("maps severity to ring colors", () => {
    expect(getMapSeverityRingColor("high")).toContain("status-urgent");
    expect(getMapSeverityRingColor("moderate")).toContain("status-pothole");
    expect(getMapSeverityRingColor("low")).toContain("status-resolved");
  });

  it("builds a selected marker icon with the shared marker classes", () => {
    const icon = createReportMarkerIcon({ category: "manhole", severity: "high", selected: true });
    const html = String(icon.options.html ?? "");

    expect(html).toContain("bk-report-marker--selected");
    expect(html).toContain("bk-report-marker__pin");
    expect(html).toContain("bk-report-marker__badge");
    expect(html).toContain("svg");
  });
});
