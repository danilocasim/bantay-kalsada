/**
 * Lightweight, privacy-safe event log for funnel debugging.
 * No free text, emails, or coordinates — only coarse step names and enums.
 */
type AnalyticsPayload = Record<string, string | number | boolean | undefined>;

const MAX_EVENTS = 200;

function bufferEvent(name: string, data?: AnalyticsPayload) {
  if (typeof window === "undefined") return;
  type Win = Window & { __bk_analytics?: Array<{ n: string; t: number; d?: AnalyticsPayload }> };
  const w = window as Win;
  w.__bk_analytics = w.__bk_analytics ?? [];
  w.__bk_analytics.push({ n: name, t: Date.now(), d: data });
  if (w.__bk_analytics.length > MAX_EVENTS) w.__bk_analytics.splice(0, w.__bk_analytics.length - MAX_EVENTS);
}

export function track(name: string, data?: AnalyticsPayload): void {
  try {
    if (import.meta.env.DEV) console.debug(`[analytics] ${name}`, data ?? {});
    bufferEvent(name, data);
  } catch {
    /* ignore */
  }
}
