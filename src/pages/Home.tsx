import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { ArrowRight, MapPin, Plus, TriangleAlert } from "lucide-react";
import { InstallPrompt } from "@/components/InstallPrompt";
import { LoadRetry } from "@/components/LoadRetry";
import { PageHeader, SoftCard, SeverityBadge, StatusBadge, EmptyState } from "@/components/ui-kit";
import { track } from "@/lib/analytics";
import { DEMO_USER_ID, getHomeInsight, listMyReports, listReports } from "@/lib/dataSource";
import { getPilotCampaign } from "@/lib/pilotCampaign";
import { getHomeTitle } from "@/lib/reporting";
import { createReportMarkerIcon } from "@/lib/mapMarkers";
import { useSession } from "@/lib/session";
import { CATEGORY_LABEL, type Report } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function Home() {
  const session = useSession();
  const [reports, setReports] = useState<Report[]>([]);
  const [myReports, setMyReports] = useState<Report[]>([]);
  const [insight, setInsight] = useState<{ area: string; summary: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const campaign = useMemo(() => getPilotCampaign(), []);

  const refresh = useCallback(async () => {
    if (!session.isReady) return;
    setError(null);
    try {
      const [all, mine, ins] = await Promise.all([
        listReports(),
        listMyReports(session.userId ?? DEMO_USER_ID),
        getHomeInsight(),
      ]);
      setReports(all);
      setMyReports(mine);
      setInsight(ins);
      track("home_refresh", { ok: true });
    } catch {
      setError("Could not load the latest data. Check your connection and try again.");
      track("home_refresh", { ok: false });
    }
  }, [session.isReady, session.userId]);

  useEffect(() => {
    if (!session.isReady) return;
    void refresh();
    track("screen_view", { name: "home" });
  }, [session.isReady, session.userId, refresh]);

  const activeReports = useMemo(
    () => reports.filter((report) => !["resolved", "community_verified"].includes(report.status)).slice(0, 3),
    [reports],
  );
  const ownRecent = myReports.slice(0, 2);
  const title = getHomeTitle(activeReports[0]?.barangay ?? insight?.area);

  return (
    <div>
      <PageHeader title={title} subtitle="Report a hazard or track what is still unresolved." />
      <div className="px-5">
        {campaign ? (
          <div
            className={cn(
              "mb-4 rounded-2xl border px-4 py-3",
              campaign.tone === "caution"
                ? "border-status-moderate/40 bg-status-moderate/10"
                : "border-primary/25 bg-primary-soft/60",
            )}
            role="region"
            aria-label="Pilot announcement"
          >
            <div className="text-sm font-semibold text-foreground">{campaign.title}</div>
            <p className="mt-1 text-xs leading-snug text-muted-foreground">{campaign.body}</p>
          </div>
        ) : null}

        {error ? (
          <div className="mb-4">
            <LoadRetry message={error} onRetry={() => void refresh()} />
          </div>
        ) : null}

        <Link
          to="/report"
          className="flex items-center gap-3 rounded-3xl bg-primary p-4 text-primary-foreground shadow-float transition active:scale-[0.99] hover:brightness-[1.03]"
          onClick={() => track("cta_report_from_home")}
        >
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary-foreground/15">
            <Plus className="h-6 w-6" strokeWidth={2.5} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[15px] font-semibold">Report an issue</div>
            <div className="mt-0.5 text-xs text-primary-foreground/80">Photo + location + short note. Usually under 2 minutes.</div>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0" aria-hidden />
        </Link>

        <InstallPrompt />
      </div>

      <section className="mt-6 px-5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-semibold tracking-tight">Needs attention nearby</h2>
          <Link to="/map" className="text-xs font-medium text-primary">
            View map
          </Link>
        </div>
        <div className="mt-3 flex flex-col gap-4">
          {activeReports.length === 0 ? (
            <EmptyState
              title="No active issues nearby"
              subtitle="New reports in your area will appear here first."
              action={
                <Link
                  to="/map"
                  className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
                >
                  Open map
                </Link>
              }
            />
          ) : (
            activeReports.map((report) => <ReportCard key={report.id} report={report} meta={`${report.confirmCount} confirms`} />)
          )}
        </div>
      </section>

      <section className="mt-6 px-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold tracking-tight">Your recent reports</h2>
          <Link to="/track" className="text-xs font-medium text-primary">
            See all
          </Link>
        </div>
        <div className="mt-3 flex flex-col gap-4">
          {ownRecent.length === 0 ? (
            <SoftCard className="bg-primary-soft p-4">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
                  <TriangleAlert className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold">You have not filed a report yet</div>
                  <p className="mt-1 text-xs text-muted-foreground">Submit one to see it here and on Track.</p>
                  <Link
                    to="/report"
                    className="mt-3 inline-flex rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
                  >
                    Report an issue
                  </Link>
                </div>
              </div>
            </SoftCard>
          ) : (
            ownRecent.map((report) => <RecentReportCard key={report.id} report={report} meta={report.updatedLabel ?? "Recently updated"} />)
          )}
        </div>
      </section>

      {insight && (
        <section className="mt-6 px-5 pb-6">
          <SoftCard className="border-border bg-surface">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40 text-muted-foreground">
                <MapPin className="h-4 w-4" strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-semibold text-foreground">{insight.area}</div>
                <p className="mt-1 text-[14px] leading-relaxed text-muted-foreground">{insight.summary}</p>
              </div>
            </div>
          </SoftCard>
        </section>
      )}
    </div>
  );
}

function ReportMiniMap({ report }: { report: Report }) {
  return (
    <div className="pointer-events-none relative isolate z-0 mt-3 h-32 overflow-hidden rounded-2xl border border-border bg-surface [&_.leaflet-container]:z-0">
      <MapContainer
        center={[report.geo.lat, report.geo.lng]}
        zoom={14}
        style={{ height: "100%", width: "100%" }}
        dragging={false}
        zoomControl={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        boxZoom={false}
        keyboard={false}
        touchZoom={false}
      >
        <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker
          position={[report.geo.lat, report.geo.lng]}
          icon={createReportMarkerIcon({ category: report.category, severity: report.severity })}
        />
      </MapContainer>
    </div>
  );
}

function ReportCard({ report, meta }: { report: Report; meta: string }) {
  const summary = (report.aiSummary || report.description || "").trim();
  const preview = summary.length > 140 ? `${summary.slice(0, 140)}…` : summary;

  return (
    <Link to={`/r/${report.id}`} state={{ reportSource: "home" as const }} className="block">
      <SoftCard className="p-4 shadow-sm transition hover:border-border hover:bg-muted/20">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-xs text-muted-foreground">
              {CATEGORY_LABEL[report.category]} · {report.barangay}
            </div>
            <div className="mt-0.5 truncate text-[15px] font-medium">{report.title}</div>
          </div>
          <SeverityBadge severity={report.severity} />
        </div>

        {report.photoURLs[0] ? (
          <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-surface">
            <img src={report.photoURLs[0]} alt={report.title} className="h-40 w-full object-cover" />
          </div>
        ) : null}

        <ReportMiniMap report={report} />

        {preview ? <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{preview}</p> : null}

        <div className="mt-2.5 flex items-center justify-between gap-3">
          <StatusBadge status={report.status} />
          <span className="text-right text-xs text-muted-foreground">{meta}</span>
        </div>
      </SoftCard>
    </Link>
  );
}

function RecentReportCard({ report, meta }: { report: Report; meta: string }) {
  return (
    <Link to={`/r/${report.id}`} className="block">
      <SoftCard className="p-4 shadow-sm transition hover:border-border hover:bg-muted/20">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-xs text-muted-foreground">
              {CATEGORY_LABEL[report.category]} · {report.barangay}
            </div>
            <div className="mt-0.5 truncate text-[15px] font-medium">{report.title}</div>
          </div>
          <SeverityBadge severity={report.severity} />
        </div>
        <div className="mt-2.5 flex items-center justify-between gap-3">
          <StatusBadge status={report.status} />
          <span className="text-right text-xs text-muted-foreground">{meta}</span>
        </div>
      </SoftCard>
    </Link>
  );
}
