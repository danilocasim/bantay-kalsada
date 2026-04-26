import { beforeEach, describe, expect, it } from "vitest";
import {
  DEMO_USER_ID,
  confirmReport,
  createReport,
  getIdentityVerification,
  getReport,
  listReports,
  listMyReports,
  resetLocalDemoState,
  submitIdentityVerification,
  updateAgencyReport,
} from "@/lib/dataSource";

describe("data source local-first behavior", () => {
  beforeEach(() => {
    resetLocalDemoState();
  });

  it("creates a new report and saves it for the current reporter", async () => {
    const created = await createReport({
      photoURL: "data:image/png;base64,abc",
      coords: { lat: 14.6, lng: 121.03 },
      category: "pothole",
      description: "Fresh pothole near the school gate",
    });

    expect(created.status).toBe("submitted");

    const myReports = await listMyReports(DEMO_USER_ID);
    expect(myReports.some((report) => report.id === created.id)).toBe(true);
  });

  it("blocks self confirmation and duplicate confirmations", async () => {
    const own = await confirmReport("demo-1", DEMO_USER_ID);
    expect(own).toEqual({ ok: false, reason: "self" });

    const first = await confirmReport("demo-2", DEMO_USER_ID);
    expect(first.ok).toBe(true);

    const duplicate = await confirmReport("demo-2", DEMO_USER_ID);
    expect(duplicate).toEqual({ ok: false, reason: "duplicate" });
  });

  it("returns the public sample image for the Espana flood demo report", async () => {
    const report = await getReport("demo-2");

    expect(report?.photoURLs[0]).toBe("/images.jpeg");
  });

  it("refreshes seeded demo report media when local storage has stale demo data", async () => {
    const staleReports = (await listReports()).map((report) =>
      report.id === "demo-2"
        ? {
            ...report,
            photoURLs: ["data:image/svg+xml;utf8,stale"],
          }
        : report,
    );

    window.localStorage.setItem("bk_reports_v1", JSON.stringify(staleReports));

    const report = await getReport("demo-2");

    expect(report?.photoURLs[0]).toBe("/images.jpeg");
  });

  it("requires proof or override reason when resolving a case", async () => {
    await expect(updateAgencyReport("demo-1", { status: "resolved" })).rejects.toThrow(
      "Resolution requires a proof photo or an override reason.",
    );

    const updated = await updateAgencyReport("demo-1", {
      status: "resolved",
      overrideReason: "Field crew completed the work before the after photo was uploaded.",
    });

    expect(updated.status).toBe("resolved");
    expect(updated.resolutionProof?.overrideReason).toContain("Field crew completed");
  });

  it("stores a pending identity verification submission", async () => {
    await submitIdentityVerification(DEMO_USER_ID, {
      idImageURL: "data:image/png;base64,id",
      selfieImageURL: "data:image/png;base64,selfie",
    });

    const verification = await getIdentityVerification(DEMO_USER_ID);
    expect(verification.status).toBe("pending_review");
    expect(verification.idImageURL).toContain("data:image/png");
  });

  it("persists updated report proof metadata", async () => {
    await updateAgencyReport("demo-4", {
      status: "resolved",
      proofPhotoURL: "data:image/png;base64,proof",
      note: "Proof uploaded after replacing the sign.",
    });

    const report = await getReport("demo-4");
    expect(report?.resolutionProof?.photoURL).toContain("data:image/png");
    expect(report?.statusEvents?.at(-1)?.status).toBe("resolved");
  });
});
