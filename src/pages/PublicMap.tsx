import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { Link } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import { PageHeader, SeverityBadge } from "@/components/ui-kit";
import { listReports } from "@/lib/dataSource";
import { CATEGORY_COLOR, CATEGORY_LABEL, type Category, type Report } from "@/lib/types";

const CATEGORIES: (Category | "all")[] = ["all", "pothole", "flood", "drainage", "manhole", "sign", "obstruction"];

export default function PublicMap() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState<Category | "all">("all");

  useEffect(() => { listReports().then(setReports); }, []);

  const filtered = filter === "all" ? reports : reports.filter((r) => r.category === filter);

  return (
    <div>
      <PageHeader title="Map" subtitle="All reports in your area" />
      <div className="px-5 overflow-x-auto">
        <div className="flex gap-2 pb-2">
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setFilter(c)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${filter === c ? "bg-foreground text-background" : "bg-surface-muted text-foreground/70 hover:bg-muted"}`}>
              {c === "all" ? "All" : CATEGORY_LABEL[c]}
            </button>
          ))}
        </div>
      </div>
      <div className="mx-5 mt-3 rounded-2xl overflow-hidden border border-border h-[60vh]">
        <MapContainer center={[14.6, 121.03]} zoom={12} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
          <TileLayer attribution='© OpenStreetMap' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {filtered.map((r) => (
            <CircleMarker key={r.id} center={[r.geo.lat, r.geo.lng]}
              radius={r.severity === "high" ? 12 : r.severity === "moderate" ? 9 : 7}
              pathOptions={{ color: CATEGORY_COLOR[r.category], fillColor: CATEGORY_COLOR[r.category], fillOpacity: 0.55, weight: 2 }}>
              <Popup>
                <div className="space-y-1.5 min-w-[180px]">
                  <div className="font-semibold text-sm">{r.title}</div>
                  <div className="text-xs text-muted-foreground">{CATEGORY_LABEL[r.category]}</div>
                  <SeverityBadge severity={r.severity} />
                  <Link to={`/r/${r.id}`} className="block text-xs font-medium text-primary mt-1.5">View details →</Link>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
      <p className="px-5 mt-3 text-xs text-muted-foreground text-center">{filtered.length} reports shown</p>
    </div>
  );
}
