import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { EmptyState, PageHeader, SoftCard, SeverityBadge, StatusBadge } from "@/components/ui-kit";
import { DEMO_AGENCY_ID, listAgencyReports, listIdentityVerifications } from "@/lib/dataSource";
import { createReportMarkerIcon } from "@/lib/mapMarkers";
import { useSession } from "@/lib/session";
import { CATEGORY_LABEL, type Report } from "@/lib/types";

type Sort = "urgency" | "newest" | "confirms";
type Filter = "all" | "urgent" | "ack" | "proof" | "reopened";

const getUpdatedRank = (label?: string): number => {
  if (!label) return 0;
  if (label === "Just now") return 10_000;
  if (label.includes("m ago")) return 9_000 - Number.parseInt(label, 10);
  if (label.includes("h ago")) return 8_000 - Number.parseInt(label, 10) * 10;
  if (label.includes("d ago")) return 7_000 - Number.parseInt(label, 10) * 100;
  if (label === "Today") return 8_500;
  if (label === "Yesterday") return 7_500;
  return 1;
};

export default function AgencyDashboard() {
  const session = useSession();
  const [reports, setReports] = useState<Report[]>([]);
  const [pendingIdentityCount, setPendingIdentityCount] = useState(0);
  const [sort, setSort] = useState<Sort>("urgency");
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    if (!session.isReady) return;
    const agencyId = session.isDemo ? DEMO_AGENCY_ID : session.agencyId;
    if (!agencyId) {
      setReports([]);
      return;
    }

    listAgencyReports(agencyId).then(setReports);
    listIdentityVerifications().then((items) => setPendingIdentityCount(items.filter((item) => item.verification.status === "pending_review").length));
  }, [session.agencyId, session.isDemo, session.isReady]);

  if (!session.isDemo && session.isReady && !session.isAgency) {
    return <EmptyState title="Agency access required" subtitle="This dashboard is only available to agency or moderator accounts." />;
  }

  const filtered = useMemo(() => {
    const visible = reports.filter((report) => {
      if (filter === "urgent") return report.severity === "high";
      if (filter === "ack") return report.status === "routed" || report.status === "submitted";
      if (filter === "proof") return report.status === "resolved" && !report.resolutionProof?.photoURL;
      if (filter === "reopened") return report.status === "reopened";
      return true;
    });

    const copy = [...visible];
    if (sort === "urgency") copy.sort((a, b) => b.urgencyScore - a.urgencyScore);
    if (sort === "confirms") copy.sort((a, b) => b.confirmCount - a.confirmCount);
    if (sort === "newest") copy.sort((a, b) => (b.updatedAtMs ?? getUpdatedRank(b.updatedLabel)) - (a.updatedAtMs ?? getUpdatedRank(a.updatedLabel)));
    return copy;
  }, [filter, reports, sort]);

  const open = reports.filter((report) => !["resolved", "community_verified"].includes(report.status)).length;
  const high = reports.filter((report) => report.severity === "high").length;

  return (
    <div>
      <PageHeader title="Agency Dashboard" subtitle="Review urgent cases, track proof requirements, and manage pilot operations." />
      <div className="px-5 grid grid-cols-3 gap-3">
        <Stat label="Open" value={open} />
        <Stat label="High" value={high} tone="text-status-urgent" />
        <Stat label="Verify" value={pendingIdentityCount} tone="text-primary" />
      </div>

      <div className="px-5 mt-4 flex gap-2 overflow-x-auto pb-2">
        {([
          ["all", "All"],
          ["urgent", "Urgent"],
          ["ack", "Awaiting acknowledgment"],
          ["proof", "Needs proof"],
          ["reopened", "Reopened"],
        ] as const).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${filter === value ? "bg-foreground text-background" : "bg-surface-muted text-foreground/70 hover:bg-muted"}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="px-5 mt-2 flex items-center justify-between">
        <h2 className="text-base font-semibold tracking-tight">Queue</h2>
        <select value={sort} onChange={(event) => setSort(event.target.value as Sort)} className="text-xs bg-surface-muted rounded-full px-3 py-1.5 border-none outline-none">
          <option value="urgency">Sort: Urgency</option>
          <option value="confirms">Sort: Confirms</option>
          <option value="newest">Sort: Newest</option>
        </select>
      </div>

      <div className="px-5 mt-3 space-y-2.5">
        {filtered.map((report) => (
          <Link key={report.id} to={`/agency/case/${report.id}`}>
            <SoftCard className="p-4 hover:bg-surface-muted/50 transition">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-muted-foreground">{CATEGORY_LABEL[report.category]} · {report.barangay}</div>
                  <div className="font-medium text-[15px] mt-0.5 truncate">{report.title}</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-muted-foreground">Urgency</div>
                  <div className="text-lg font-semibold tracking-tight">{report.urgencyScore}</div>
                </div>
              </div>
              <div className="mt-2.5 flex items-center justify-between gap-3">
                <div className="flex gap-2 flex-wrap">
                  <SeverityBadge severity={report.severity} />
                  <StatusBadge status={report.status} />
                </div>
                <span className="text-xs text-muted-foreground">{report.confirmCount} confirms</span>
              </div>
              {report.status === "resolved" && !report.resolutionProof?.photoURL && (
                <div className="mt-3 rounded-2xl bg-status-pothole/10 text-status-pothole px-3 py-2 text-xs font-medium">Resolved without proof photo. Needs review.</div>
              )}
            </SoftCard>
          </Link>
        ))}
      </div>

      <div className="mx-5 mt-5 mb-6 rounded-3xl overflow-hidden border border-border h-56">
        <MapContainer center={[14.6, 121.03]} zoom={11} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
          <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {reports.map((report) => (
            <Marker
              key={report.id}
              position={[report.geo.lat, report.geo.lng]}
              icon={createReportMarkerIcon({ category: report.category, severity: report.severity })}
            />
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

function Stat({ label, value, tone = "text-foreground" }: { label: string; value: number; tone?: string }) {
  return (
    <div className="rounded-2xl bg-surface border border-border p-4">
      <div className={`text-2xl font-semibold tracking-tight ${tone}`}>{value}</div>
      <div className="text-[11px] text-muted-foreground uppercase tracking-wide mt-0.5">{label}</div>
    </div>
  );
}
