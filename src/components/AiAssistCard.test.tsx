import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AiAssistCard } from "@/components/AiAssistCard";

describe("AiAssistCard", () => {
  it("shows visible AI-assisted review details for citizens", () => {
    render(
      <AiAssistCard
        report={{
          category: "pothole",
          severity: "moderate",
          aiCategory: "flood",
          aiSeverity: "high",
          aiSummary: "AI suggests the issue is active flooding and should be prioritized for field review.",
          agencyName: "MMDA",
          routingConfidence: 0.78,
        }}
      />,
    );

    expect(screen.getByText("Review suggestions")).toBeInTheDocument();
    expect(screen.getByText("Suggested category")).toBeInTheDocument();
    expect(screen.getByText("Flooded Area")).toBeInTheDocument();
    expect(screen.getByText(/High confidence/i)).toBeInTheDocument();
    expect(screen.getByText(/MMDA/i)).toBeInTheDocument();
    expect(screen.getByText(/AI suggests the issue is active flooding/i)).toBeInTheDocument();
  });

  it("shows official AI draft details for agency users", () => {
    render(
      <AiAssistCard
        variant="agency"
        report={{
          category: "sign",
          severity: "moderate",
          aiOfficialReport: "Broken regulatory sign near the intersection. Site inspection and replacement recommended.",
          agencyName: "City Engineering Office",
        }}
      />,
    );

    expect(screen.getByText("Triage suggestions")).toBeInTheDocument();
    expect(screen.getByText("Incident draft")).toBeInTheDocument();
    expect(screen.getByText(/Site inspection and replacement recommended/i)).toBeInTheDocument();
  });
});
