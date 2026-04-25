import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { Link } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import { EmptyState, PageHeader, SeverityBadge, SoftCard, StatusBadge } from "@/components/ui-kit";
import { listReports } from "@/lib/dataSource";
import { createReportMarkerIcon } from "@/lib/mapMarkers";
import { CATEGORY_LABEL, PRIMARY_CATEGORY_OPTIONS, type Category, type Report } from "@/lib/types";

const CATEGORIES: (Category | "all")[] = ["all", ...PRIMARY_CATEGORY_OPTIONS, "sign", "obstruction", "other"];

export default function PublicMap() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState<Category | "all">("all");
  const [view, setView] = useState<"list" | "map">("list");
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  useEffect(() => { listReports().then(setReports); }, []);

  const filtered = useMemo(
    () => {
      const activeReports = reports.filter((report) => !["resolved", "community_verified"].includes(report.status));
      return filter === "all" ? activeReports : activeReports.filter((report) => report.category === filter);
    },
    [filter, reports],
  );

  useEffect(() => {
    if (!filtered.length) {
      setSelectedReportId(null);
      return;
    }

    if (!selectedReportId || !filtered.some((report) => report.id === selectedReportId)) {
      setSelectedReportId(filtered[0].id);
    }
  }, [filtered, selectedReportId]);

  const selectedReport = filtered.find((report) => report.id === selectedReportId) ?? null;

  return (
    <div>
      <PageHeader title="Map" subtitle="Browse active road issues by list or map." />
      <div className="px-5 overflow-x-auto">
        <div className="flex gap-2 pb-2">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${filter === category ? "bg-foreground text-background" : "bg-surface-muted text-foreground/70 hover:bg-muted"}`}
            >
              {category === "all" ? "All" : CATEGORY_LABEL[category]}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 mt-3">
        <div className="inline-flex rounded-full bg-surface-muted p-1 border border-border">
          {(["list", "map"] as const).map((option) => (
            <button
              key={option}
              onClick={() => setView(option)}
              className={`px-4 py-2 rounded-full text-xs font-semibold capitalize transition ${view === option ? "bg-surface shadow-soft text-foreground" : "text-muted-foreground"}`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {view === "list" ? (
        <div className="px-5 mt-4 space-y-2.5 pb-6">
          {filtered.length === 0 ? (
            <EmptyState title="No matching reports" subtitle="Try another category or switch to the map view." />
          ) : (
            filtered.map((report) => (
              <Link key={report.id} to={`/r/${report.id}`}>
                <SoftCard className="p-4 hover:bg-surface-muted/50 transition">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-muted-foreground">{CATEGORY_LABEL[report.category]} · {report.barangay}</div>
                      <div className="font-medium text-[15px] mt-0.5 truncate">{report.title}</div>
                    </div>
                    <SeverityBadge severity={report.severity} />
                  </div>
                  <div className="mt-2.5 flex items-center justify-between gap-3">
                    <StatusBadge status={report.status} />
                    <span className="text-xs text-muted-foreground">{report.confirmCount} confirms</span>
                  </div>
                </SoftCard>
              </Link>
            ))
          )}
        </div>
      ) : (
        <>
          <div className="mx-5 mt-4 rounded-3xl overflow-hidden border border-border h-[56vh] relative">
            <MapContainer center={[14.6, 121.03]} zoom={12} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
              <TileLayer attribution="© OpenStreetMap" url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {selectedReport && <MapSelectionUpdater lat={selectedReport.geo.lat} lng={selectedReport.geo.lng} />}
              {filtered.map((report) => (
                <Marker
                  key={report.id}
                  position={[report.geo.lat, report.geo.lng]}
                  icon={createReportMarkerIcon({
                    category: report.category,
                    severity: report.severity,
                    selected: report.id === selectedReportId,
                  })}
                  eventHandlers={{ click: () => setSelectedReportId(report.id) }}
                />
              ))}
            </MapContainer>

            {selectedReport && (
              <div className="absolute inset-x-3 bottom-3 z-[500] pointer-events-none">
                <div className="pointer-events-auto rounded-3xl bg-surface/95 backdrop-blur border border-border shadow-float p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-muted-foreground">{CATEGORY_LABEL[selectedReport.category]} · {selectedReport.barangay}</div>
                      <div className="font-semibold text-[15px] mt-0.5 truncate">{selectedReport.title}</div>
                    </div>
                    <SeverityBadge severity={selectedReport.severity} />
                  </div>
                  <div className="mt-2.5 flex items-center justify-between gap-3">
                    <StatusBadge status={selectedReport.status} />
                    <span className="text-xs text-muted-foreground">{selectedReport.confirmCount} confirms</span>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground truncate">{selectedReport.address}</div>
                  <Link
                    to={`/r/${selectedReport.id}`}
                    className="mt-3 w-full py-3 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm text-center block"
                  >
                    View case
                  </Link>
                </div>
              </div>
            )}
          </div>
          <p className="px-5 mt-3 text-xs text-muted-foreground text-center">{filtered.length} active reports shown on the map.</p>
        </>
      )}
    </div>
  );
}

function MapSelectionUpdater({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();

  useEffect(() => {
    map.panTo([lat, lng], { animate: true });
  }, [lat, lng, map]);

  return null;
}
