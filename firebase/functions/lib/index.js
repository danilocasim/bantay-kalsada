"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onReportStatusChange = exports.analyzeReport = exports.setUserRole = void 0;
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const messaging_1 = require("firebase-admin/messaging");
const auth_1 = require("firebase-admin/auth");
const firestore_2 = require("firebase-functions/v2/firestore");
const https_1 = require("firebase-functions/v2/https");
const params_1 = require("firebase-functions/params");
(0, app_1.initializeApp)();
const GEMINI_API_KEY = (0, params_1.defineSecret)("GEMINI_API_KEY");
async function getInlineImagePart(photoUrl) {
    if (!photoUrl)
        return null;
    try {
        const response = await fetch(photoUrl);
        if (!response.ok)
            return null;
        const mimeType = response.headers.get("content-type") ?? "image/jpeg";
        if (!mimeType.startsWith("image/"))
            return null;
        const buffer = Buffer.from(await response.arrayBuffer());
        return {
            inlineData: {
                mimeType,
                data: buffer.toString("base64"),
            },
        };
    }
    catch {
        return null;
    }
}
function getAgencySuggestion(category) {
    if (["flood", "manhole", "sign", "obstruction"].includes(category)) {
        return { agencyId: "demo-mmda", agencyName: "MMDA", routingConfidence: 0.73 };
    }
    if (["pothole", "drainage"].includes(category)) {
        return { agencyId: "demo-dpwh", agencyName: "DPWH NCR", routingConfidence: 0.69 };
    }
    return { agencyId: "demo-city-engineering", agencyName: "City Engineering Office", routingConfidence: 0.42 };
}
function getStatusNote(status, report) {
    if (status === "ai_reviewed")
        return "Reviewed and categorized.";
    if (status === "routed")
        return `Routed to ${String(report.agencyName ?? "the likely office")}.`;
    if (status === "acknowledged")
        return `${String(report.agencyName ?? "The handling team")} acknowledged the case.`;
    if (status === "scheduled")
        return "Work has been scheduled.";
    if (status === "in_progress")
        return "Repair or field work is underway.";
    if (status === "resolved") {
        const proof = report.resolutionProof;
        return proof?.overrideReason
            ? `Resolved with manual override: ${proof.overrideReason}`
            : `Marked resolved by ${String(report.agencyName ?? "the handling team")}.`;
    }
    if (status === "reopened")
        return "Community reported that the issue is still unresolved.";
    return "Status updated.";
}
/** Set custom-claims role. Admin-only. */
exports.setUserRole = (0, https_1.onCall)(async (req) => {
    if (req.auth?.token.role !== "admin") {
        throw new https_1.HttpsError("permission-denied", "Admin only.");
    }
    const { uid, role, agencyId } = req.data;
    await (0, auth_1.getAuth)().setCustomUserClaims(uid, { role, ...(agencyId ? { agencyId } : {}) });
    return { ok: true };
});
/** Analyze report on creation: classify image, summarize, set agency. */
exports.analyzeReport = (0, firestore_2.onDocumentCreated)({ document: "reports/{id}", secrets: [GEMINI_API_KEY] }, async (event) => {
    const snap = event.data;
    if (!snap)
        return;
    const r = snap.data();
    const photo = (r.photoURLs ?? [])[0];
    await snap.ref.collection("statusEvents").add({
        status: "submitted",
        note: "Report received from the community.",
        source: "system",
        at: firestore_1.FieldValue.serverTimestamp(),
    });
    const prompt = `You are a civic infrastructure analyst. Given a report titled "${r.title}" with description "${r.description ?? ""}" at ${r.geo?.lat},${r.geo?.lng}, return JSON: { "category": one of [pothole,flood,drainage,manhole,sign,obstruction,other], "severity": one of [low,moderate,high], "summary": 1-2 sentences, "officialReport": a clean formal incident report. ${photo ? "Consider the attached photo." : ""}`;
    try {
        const imagePart = await getInlineImagePart(photo);
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY.value()}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: imagePart ? [{ text: prompt }, imagePart] : [{ text: prompt }] }],
                generationConfig: { responseMimeType: "application/json" },
            }),
        });
        const data = (await res.json());
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
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
        });
    }
    catch (e) {
        console.error("analyzeReport failed", e);
        await snap.ref.update({ status: "ai_reviewed", aiSummary: "AI analysis unavailable.", updatedAt: firestore_1.FieldValue.serverTimestamp() });
    }
});
/** Notify reporter on status change via FCM. */
exports.onReportStatusChange = (0, firestore_2.onDocumentUpdated)("reports/{id}", async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after || before.status === after.status)
        return;
    await event.data.after.ref.collection("statusEvents").add({
        status: after.status,
        note: getStatusNote(after.status, after),
        source: "system",
        at: firestore_1.FieldValue.serverTimestamp(),
    });
    if (!after.reporterUid)
        return;
    const tokensSnap = await (0, firestore_1.getFirestore)()
        .collection("fcmTokens")
        .doc(after.reporterUid)
        .collection("tokens")
        .get();
    const tokens = tokensSnap.docs.map((d) => d.id);
    if (!tokens.length)
        return;
    await (0, messaging_1.getMessaging)().sendEachForMulticast({
        tokens,
        notification: {
            title: `Report update: ${after.status}`,
            body: after.title ?? "Your report has a new status.",
        },
    });
});
//# sourceMappingURL=index.js.map