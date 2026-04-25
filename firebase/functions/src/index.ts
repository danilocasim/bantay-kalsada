import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";
import { getAuth } from "firebase-admin/auth";
import { onDocumentCreated, onDocumentUpdated } from "firebase-functions/v2/firestore";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";

initializeApp();
const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY");

type SupportedRole = "citizen" | "agency_official" | "admin";

async function getInlineImagePart(photoUrl?: string) {
  if (!photoUrl) return null;

  try {
    const response = await fetch(photoUrl);
    if (!response.ok) return null;

    const mimeType = response.headers.get("content-type") ?? "image/jpeg";
    if (!mimeType.startsWith("image/")) return null;

    const buffer = Buffer.from(await response.arrayBuffer());
    return {
      inlineData: {
        mimeType,
        data: buffer.toString("base64"),
      },
    };
  } catch {
    return null;
  }
}

function getAgencySuggestion(category: string) {
  if (["flood", "manhole", "sign", "obstruction"].includes(category)) {
    return { agencyId: "demo-mmda", agencyName: "MMDA", routingConfidence: 0.73 };
  }

  if (["pothole", "drainage"].includes(category)) {
    return { agencyId: "demo-dpwh", agencyName: "DPWH NCR", routingConfidence: 0.69 };
  }

  return { agencyId: "demo-city-engineering", agencyName: "City Engineering Office", routingConfidence: 0.42 };
}

function getStatusNote(status: string, report: Record<string, unknown>) {
  if (status === "ai_reviewed") return "Reviewed and categorized.";
  if (status === "routed") return `Routed to ${String(report.agencyName ?? "the likely office")}.`;
  if (status === "acknowledged") return `${String(report.agencyName ?? "The handling team")} acknowledged the case.`;
  if (status === "scheduled") return "Work has been scheduled.";
  if (status === "in_progress") return "Repair or field work is underway.";
  if (status === "resolved") {
    const proof = report.resolutionProof as { overrideReason?: string } | undefined;
    return proof?.overrideReason
      ? `Resolved with manual override: ${proof.overrideReason}`
      : `Marked resolved by ${String(report.agencyName ?? "the handling team")}.`;
  }
  if (status === "reopened") return "Community reported that the issue is still unresolved.";
  return "Status updated.";
}

/** Set custom-claims role. Admin-only. */
export const setUserRole = onCall(async (req) => {
  if (req.auth?.token.role !== "admin") {
    throw new HttpsError("permission-denied", "Admin only.");
  }
  const { uid, role, agencyId } = req.data as { uid: string; role: SupportedRole; agencyId?: string };
  await getAuth().setCustomUserClaims(uid, { role, ...(agencyId ? { agencyId } : {}) });
  return { ok: true };
});

/** Analyze report on creation: classify image, summarize, set agency. */
export const analyzeReport = onDocumentCreated(
  { document: "reports/{id}", secrets: [GEMINI_API_KEY] },
  async (event) => {
    const snap = event.data;
    if (!snap) return;
    const r = snap.data();
    const photo = (r.photoURLs ?? [])[0];

    await snap.ref.collection("statusEvents").add({
      status: "submitted",
      note: "Report received from the community.",
      source: "system",
      at: FieldValue.serverTimestamp(),
    });

    const prompt = `You are a civic infrastructure analyst. Given a report titled "${r.title}" with description "${r.description ?? ""}" at ${r.geo?.lat},${r.geo?.lng}, return JSON: { "category": one of [pothole,flood,drainage,manhole,sign,obstruction,other], "severity": one of [low,moderate,high], "summary": 1-2 sentences, "officialReport": a clean formal incident report. ${photo ? "Consider the attached photo." : ""}`;

    try {
      const imagePart = await getInlineImagePart(photo);
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY.value()}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: imagePart ? [{ text: prompt }, imagePart] : [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" },
          }),
        },
      );
      const data = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
      const parsed = JSON.parse(text);
      const suggestedCategory = parsed.category ?? r.category;
      const agency = getAgencySuggestion(suggestedCategory);

      await snap.ref.update({
        aiCategory: suggestedCategory,
        aiSeverity: parsed.severity ?? "moderate",
        aiSummary: parsed.summary ?? "",
        aiOfficialReport: parsed.officialReport ?? "",
        severity: parsed.severity ?? r.severity,
        agencyId: agency.agencyId,
        status: "ai_reviewed",
        agencyName: agency.agencyName,
        routingConfidence: agency.routingConfidence,
        updatedAt: FieldValue.serverTimestamp(),
      });
    } catch (e) {
      console.error("analyzeReport failed", e);
      await snap.ref.update({ status: "ai_reviewed", aiSummary: "AI analysis unavailable.", updatedAt: FieldValue.serverTimestamp() });
    }
  },
);

/** Notify reporter on status change via FCM. */
export const onReportStatusChange = onDocumentUpdated("reports/{id}", async (event) => {
  const before = event.data?.before.data();
  const after = event.data?.after.data();
  if (!before || !after || before.status === after.status) return;

  await event.data!.after.ref.collection("statusEvents").add({
    status: after.status,
    note: getStatusNote(after.status, after),
    source: "system",
    at: FieldValue.serverTimestamp(),
  });

  if (!after.reporterUid) return;
  const tokensSnap = await getFirestore()
    .collection("fcmTokens")
    .doc(after.reporterUid)
    .collection("tokens")
    .get();
  const tokens = tokensSnap.docs.map((d) => d.id);
  if (!tokens.length) return;

  await getMessaging().sendEachForMulticast({
    tokens,
    notification: {
      title: `Report update: ${after.status}`,
      body: after.title ?? "Your report has a new status.",
    },
  });
});
