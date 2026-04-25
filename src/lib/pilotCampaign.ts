export type PilotCampaign = {
  title: string;
  body: string;
  /** info = default blue-tint; caution = amber border */
  tone?: "info" | "caution";
};

/**
 * Optional JSON via VITE_PILOT_CAMPAIGN_JSON, e.g.
 * {"title":"Flood readiness week","body":"Prioritize drainage and flood reports this week.","tone":"caution"}
 */
export function getPilotCampaign(): PilotCampaign | null {
  const raw = import.meta.env.VITE_PILOT_CAMPAIGN_JSON as string | undefined;
  if (!raw?.trim()) return null;
  try {
    const v = JSON.parse(raw) as PilotCampaign;
    if (typeof v?.title === "string" && typeof v?.body === "string" && v.title && v.body) {
      return { title: v.title, body: v.body, tone: v.tone === "caution" ? "caution" : "info" };
    }
  } catch {
    /* invalid env */
  }
  return null;
}
