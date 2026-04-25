import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import type { Report, StatusEvent } from "@/lib/types";
import ReportDetail from "@/pages/ReportDetail";

const mockGetReport = vi.fn();
const mockSubscribeReport = vi.fn();
const mockSubscribeStatusEvents = vi.fn();
const mockConfirmReport = vi.fn();
const mockReopenReport = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useParams: () => ({ id: "demo-2" }),
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: "/r/demo-2", state: null as unknown, search: "", hash: "", key: "default" }),
  };
});

vi.mock("react-leaflet", () => ({
  MapContainer: ({ children }: { children: ReactNode }) => <div data-testid="map">{children}</div>,
  Marker: () => <div data-testid="marker" />,
  TileLayer: () => null,
}));

vi.mock("@/lib/mapMarkers", () => ({
  createReportMarkerIcon: vi.fn(() => ({})),
}));

vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

vi.mock("@/lib/dataSource", () => ({
  DEMO_USER_ID: "demo-user",
  getReport: (...args: unknown[]) => mockGetReport(...args),
  subscribeReport: (...args: unknown[]) => mockSubscribeReport(...args),
  subscribeStatusEvents: (...args: unknown[]) => mockSubscribeStatusEvents(...args),
  confirmReport: (...args: unknown[]) => mockConfirmReport(...args),
  reopenReport: (...args: unknown[]) => mockReopenReport(...args),
}));

const baseReport: Report = {
  id: "demo-2",
  title: "Flooded underpass",
  description: "Flooding below the bridge after heavy rain.",
  category: "flood",
  severity: "high",
  status: "acknowledged",
  geo: { lat: 14.6, lng: 121.03 },
  geohash: "demo",
  address: "España Blvd",
  barangay: "Sampaloc",
  city: "Manila",
  reporterUid: "demo-user-2",
  anonymous: false,
  photoURLs: ["data:image/png;base64,abc"],
  confirmCount: 12,
  urgencyScore: 90,
  confirmedBy: [],
};

const baseEvents: StatusEvent[] = [
  { id: "e1", status: "submitted", atLabel: "Today", note: "Report received from the community." },
];

describe("ReportDetail confirm UX", () => {
  beforeEach(() => {
    mockGetReport.mockReset();
    mockSubscribeReport.mockReset();
    mockSubscribeStatusEvents.mockReset();
    mockConfirmReport.mockReset();
    mockReopenReport.mockReset();

    mockSubscribeReport.mockImplementation((_id: string, callback: (report: Report | null) => void) => {
      callback({ ...baseReport });
      return vi.fn();
    });
    mockSubscribeStatusEvents.mockImplementation((_id: string, callback: (events: StatusEvent[]) => void) => {
      callback(baseEvents);
      return vi.fn();
    });
  });

  it("shows a reporter state instead of a confirm CTA on your own report", async () => {
    mockSubscribeReport.mockImplementation((_id: string, callback: (report: Report | null) => void) => {
      callback({ ...baseReport, reporterUid: "demo-user" });
      return vi.fn();
    });

    render(<ReportDetail />);

    expect(await screen.findByText("Waiting for confirmations")).toBeInTheDocument();
    expect(screen.getByText("Reporter")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Confirm this issue" })).not.toBeInTheDocument();
  });

  it("switches to a persistent confirmed state after a successful confirm", async () => {
    const updatedReport: Report = {
      ...baseReport,
      confirmCount: 13,
      confirmedBy: ["demo-user"],
    };
    mockConfirmReport.mockResolvedValue({ ok: true, report: updatedReport });

    render(<ReportDetail />);

    fireEvent.click(await screen.findByRole("button", { name: "Confirm this issue" }));

    expect((await screen.findAllByText("Confirmed by you")).length).toBeGreaterThan(0);
    expect(screen.getByText(/13 community confirmations/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "You confirmed this issue" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Confirm this issue" })).not.toBeInTheDocument();
  });

  it("renders a confirmed state when the viewer already confirmed the issue", async () => {
    mockSubscribeReport.mockImplementation((_id: string, callback: (report: Report | null) => void) => {
      callback({ ...baseReport, confirmedBy: ["demo-user"] });
      return vi.fn();
    });

    render(<ReportDetail />);

    expect((await screen.findAllByText("Confirmed by you")).length).toBeGreaterThan(0);
    expect(screen.getByText("Confirmation on file")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Confirm this issue" })).not.toBeInTheDocument();
  });

  it("shows the 8888 escalation prompt for the original reporter after 20 unresolved days", async () => {
    mockSubscribeReport.mockImplementation((_id: string, callback: (report: Report | null) => void) => {
      callback({
        ...baseReport,
        reporterUid: "demo-user",
        createdAtMs: Date.now() - 21 * 24 * 60 * 60 * 1000,
      });
      return vi.fn();
    });

    render(<ReportDetail />);

    expect(await screen.findByText(/still unresolved after/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Prepare 8888 email/i })).toBeInTheDocument();
  });

  it("refreshes the report when a duplicate confirm is returned", async () => {
    mockConfirmReport.mockResolvedValue({ ok: false, reason: "duplicate" });
    mockGetReport.mockResolvedValue({ ...baseReport, confirmCount: 13, confirmedBy: ["demo-user"] });

    render(<ReportDetail />);

    fireEvent.click(await screen.findByRole("button", { name: "Confirm this issue" }));

    await waitFor(() => expect(mockGetReport).toHaveBeenCalledTimes(1));
    expect((await screen.findAllByText("Confirmed by you")).length).toBeGreaterThan(0);
  });
});
