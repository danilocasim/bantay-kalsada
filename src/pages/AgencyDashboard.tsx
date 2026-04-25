import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { PageHeader, SoftCard, SeverityBadge, StatusBadge } from "@/components/ui-kit";
import { listAgencyReports } from "@/lib/dataSource";
import { CATEGORY_COLOR, CATEGORY_LABEL, type Report } from "@/lib/types";

type Sort = "urgency" | "newest" | "confirms";

export default function AgencyDashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [sort, setSort] = useState<Sort>("urgency");
  useEffect(() => { listAgencyReports("demo-mmda").then(setReports); }, []);

  const sorted = useMemo(() => {
    const copy = [...reports];
    if (sort === "urgency") copy.sort((a, b) => b.urgencyScore - a.urgencyScore);
    if (sort === "confirms") copy.sort((a, b) => b.confirmCount - a.confirmCount);
    return copy;
  }, [reports, sort]);

  const open = reports.filter((r) => !["resolved", "community_verified"].includes(r.status)).length;
  const high = reports.filter((r) => r.severity === "high").length;

  return (
    <div>
      <PageHeader title="Agency Dashboard" subtitle="Triage queue and live map" />
      <div className="px-5 grid grid-cols-3 gap-3">
        <Stat label="Open" value={open} />
        <Stat label="High" value={high} tone="text-status-urgent" />
        <Stat label="Total" value={reports.length} />
      </div>
      <div className="mx-5 mt-4 rounded-2xl overflow-hidden border border-border h-56">
        <MapContainer center={[14.6, 121.03]} zoom={11} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
          <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {reports.map((r) => (
            <CircleMarker key={r.id} center={[r.geo.lat, r.geo.lng]} radius={r.severity === "high" ? 14 : 10}
              pathOptions={{ color: CATEGORY_COLOR[r.category], fillColor: CATEGORY_COLOR[r.category], fillOpacity: 0.4 }} />
          ))}
        </MapContainer>
      </div>
      <div className="px-5 mt-5 flex items-center justify-between">
        <h2 className="text-base font-semibold tracking-tight">Queue</h2>
        <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}
          className="text-xs bg-surface-muted rounded-full px-3 py-1.5 border-none outline-none">
          <option value="urgency">Sort: Urgency</option>
          <option value="confirms">Sort: Confirms</option>
          <option value="newest">Sort: Newest</option>
        </select>
      </div>
      <div className="px-5 mt-3 space-y-2.5">
        {sorted.map((r) => (
          <Link key={r.id} to={`/agency/case/${r.id}`}>
            <SoftCard className="p-4 hover:bg-surface-muted/50 transition">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-muted-foreground">{CATEGORY_LABEL[r.category]} · {r.barangay}</div>
                  <div className="font-medium text-[15px] mt-0.5 truncate">{r.title}</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-muted-foreground">Urgency</div>
                  <div className="text-lg font-semibold tracking-tight">{r.urgencyScore}</div>
                </div>
              </div>
              <div className="mt-2.5 flex items-center justify-between">
                <div className="flex gap-2">
                  <SeverityBadge severity={r.severity} />
                  <StatusBadge status={r.status} />
                </div>
                <span className="text-xs text-muted-foreground">{r.confirmCount} confirms</span>
              </div>
            </SoftCard>
          </Link>
        ))}
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
