import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";
import { getAuth } from "firebase-admin/auth";
import { onDocumentCreated, onDocumentUpdated } from "firebase-functions/v2/firestore";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";

initializeApp();
const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY");

/** Set custom-claims role. Admin-only. */
export const setUserRole = onCall(async (req) => {
  if (req.auth?.token.role !== "admin") {
    throw new HttpsError("permission-denied", "Admin only.");
  }
  const { uid, role } = req.data as { uid: string; role: "citizen" | "agency_official" | "admin" };
  await getAuth().setCustomUserClaims(uid, { role });
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

    const prompt = `You are a civic infrastructure analyst. Given a report titled "${r.title}" with description "${r.description ?? ""}" at ${r.geo?.lat},${r.geo?.lng}, return JSON: { "category": one of [pothole,flood,drainage,manhole,sign,obstruction,other], "severity": one of [low,moderate,high], "summary": 1-2 sentences, "officialReport": a clean formal incident report. ${photo ? "Consider the attached photo." : ""}`;

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY.value()}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" },
          }),
        },
      );
      const data = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
      const parsed = JSON.parse(text);

      await snap.ref.update({
        aiCategory: parsed.category ?? r.category,
        aiSeverity: parsed.severity ?? "moderate",
        aiSummary: parsed.summary ?? "",
        aiOfficialReport: parsed.officialReport ?? "",
        severity: parsed.severity ?? r.severity,
        status: "ai_reviewed",
        agencyName: "City Engineering Office",
        updatedAt: FieldValue.serverTimestamp(),
      });
    } catch (e) {
      console.error("analyzeReport failed", e);
      await snap.ref.update({ status: "ai_reviewed", aiSummary: "AI analysis unavailable." });
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