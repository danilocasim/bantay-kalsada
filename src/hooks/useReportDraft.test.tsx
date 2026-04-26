import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useReportDraft } from "@/hooks/useReportDraft";

function DraftHarness() {
  const { draft, updateDraft } = useReportDraft();

  return (
    <div>
      <button
        type="button"
        onClick={() =>
          updateDraft({
            photo: "data:image/jpeg;base64,large-camera-photo",
            description: "Fresh pothole near the curb",
          })
        }
      >
        Save photo draft
      </button>
      <div data-testid="draft-state">{draft.photo ? `photo:${draft.description}` : `no-photo:${draft.description}`}</div>
    </div>
  );
}

describe("useReportDraft", () => {
  afterEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("keeps the in-memory draft when storage rejects a large camera photo", () => {
    const originalSetItem = window.localStorage.setItem.bind(window.localStorage);

    const setItemSpy = vi.spyOn(window.localStorage, "setItem").mockImplementation((key: string, value: string) => {
      if (value.includes("data:image/jpeg;base64,large-camera-photo")) {
        throw new DOMException("The quota has been exceeded.", "QuotaExceededError");
      }

      originalSetItem(key, value);
    });

    render(<DraftHarness />);

    fireEvent.click(screen.getByRole("button", { name: "Save photo draft" }));

    expect(screen.getByTestId("draft-state")).toHaveTextContent("photo:Fresh pothole near the curb");
    expect(window.localStorage.getItem("bk_report_draft_v1")).toBe(
      JSON.stringify({ category: "pothole", description: "Fresh pothole near the curb" }),
    );
    expect(setItemSpy).toHaveBeenCalledTimes(2);
  });
});
