import { useCallback, useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { Link, useSearchParams } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import { Crosshair, Info, Search as SearchIcon, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { EmptyState, PageHeader, SeverityBadge, SoftCard, StatusBadge } from "@/components/ui-kit";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { distanceKm } from "@/lib/geo";
import { track } from "@/lib/analytics";
import { listReports } from "@/lib/dataSource";
import { createReportMarkerIcon } from "@/lib/mapMarkers";
import {
  CATEGORY_LABEL,
  PRIMARY_CATEGORY_OPTIONS,
  SECONDARY_CATEGORY_OPTIONS,
  STATUS_DESCRIPTION,
  STATUS_LABEL,
  type Category,
  type Report,
  type ReportStatus,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { LoadRetry } from "@/components/LoadRetry";

const CATEGORIES: (Category | "all")[] = ["all", ...PRIMARY_CATEGORY_OPTIONS, ...SECONDARY_CATEGORY_OPTIONS];

function parseCategoryParam(value: string | null): Category | null {
  if (!value) return null;
  return CATEGORIES.includes(value as Category) && value !== "all" ? (value as Category) : null;
}

const STATUS_SAMPLES: ReportStatus[] = ["submitted", "in_progress", "resolved", "reopened"];

export default function PublicMap() {
  const online = useOnlineStatus();
  const [searchParams, setSearchParams] = useSearchParams();
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState<Category | "all">("all");
  const [view, setView] = useState<"list" | "map">("list");
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [listQuery, setListQuery] = useState("");
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [tilesFailed, setTilesFailed] = useState(false);
  const [legendOpen, setLegendOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoadError(null);
    setLoading(true);
    try {
      const items = await listReports();
      setReports(items);
      track("map_load", { ok: true });
    } catch {
      setLoadError("Could not load reports.");
      track("map_load", { ok: false });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    track("screen_view", { name: "map" });
  }, [load]);

  useEffect(() => {
    const c = parseCategoryParam(searchParams.get("category"));
    if (c) setFilter(c);
    const r = searchParams.get("report");
    if (r) setSelectedReportId(r);
  }, [searchParams]);

  const syncParams = useCallback(
    (next: { category?: Category | "all"; reportId?: string | null }) => {
      const p = new URLSearchParams(searchParams);
      const cat = next.category ?? filter;
      if (cat === "all") p.delete("category");
      else p.set("category", cat);
      const rid = next.reportId !== undefined ? next.reportId : selectedReportId;
      if (rid) p.set("report", rid);
      else p.delete("report");
      setSearchParams(p, { replace: true });
    },
    [filter, searchParams, selectedReportId, setSearchParams],
  );

  const setFilterAndSync = (category: Category | "all") => {
    setFilter(category);
    syncParams({ category });
    track("map_filter_category", { category: category === "all" ? "all" : category });
  };

  const setSelectedAndSync = (id: string | null) => {
    setSelectedReportId(id);
    syncParams({ reportId: id });
  };

  const filtered = useMemo(() => {
    const activeReports = reports.filter((report) => !["resolved", "community_verified"].includes(report.status));
    let list = filter === "all" ? activeReports : activeReports.filter((report) => report.category === filter);
    const q = listQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((r) => {
        const t = (r.title ?? "").toLowerCase();
        const b = (r.barangay ?? "").toLowerCase();
        const a = (r.address ?? "").toLowerCase();
        return t.includes(q) || b.includes(q) || a.includes(q);
      });
    }
    if (userPos) {
      list = [...list].sort(
        (a, b) =>
          distanceKm(userPos, a.geo) - distanceKm(userPos, b.geo),
      );
    }
    return list;
  }, [filter, reports, listQuery, userPos]);

  useEffect(() => {
    if (!filtered.length) {
      setSelectedReportId(null);
      const p = new URLSearchParams(searchParams);
      if (p.has("report")) {
        p.delete("report");
        setSearchParams(p, { replace: true });
      }
      return;
    }
    const fromUrl = searchParams.get("report");
    if (fromUrl && filtered.some((r) => r.id === fromUrl)) {
      if (selectedReportId !== fromUrl) setSelectedReportId(fromUrl);
      return;
    }
    if (!selectedReportId || !filtered.some((report) => report.id === selectedReportId)) {
      const next = filtered[0].id;
      setSelectedReportId(next);
      const p = new URLSearchParams(searchParams);
      if (filter !== "all") p.set("category", filter);
      else p.delete("category");
      p.set("report", next);
      setSearchParams(p, { replace: true });
    }
  }, [filtered, filter, searchParams, selectedReportId, setSearchParams]);

  const selectedReport = filtered.find((report) => report.id === selectedReportId) ?? null;

  const nearMe = () => {
    if (!navigator.geolocation) {
      toast.error("Location is not available on this device.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        toast.success("Sorted by distance from you. Map view will center on your area.");
        track("map_near_me", { ok: true });
      },
      () => {
        toast.error("Could not read your location. Check permissions.");
        track("map_near_me", { ok: false });
      },
    );
  };

  return (
    <div>
      <PageHeader
        title="Map"
        subtitle="Active reports nearby — list or map view."
        right={
          <button
            type="button"
            onClick={() => setLegendOpen(true)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-foreground transition hover:bg-muted"
            aria-label="Open map legend"
          >
            <Info className="h-4 w-4" strokeWidth={2} />
          </button>
        }
      />

      {!online ? (
        <div className="mx-5 mb-3 flex items-center gap-2 rounded-xl border border-border bg-muted/50 px-3 py-2 text-xs text-foreground">
          <WifiOff className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          <span>You&apos;re offline. List data may be stale; map tiles need a connection.</span>
        </div>
      ) : null}

      <div className="space-y-2 px-5">
        <label className="sr-only" htmlFor="map-list-search">
          Search reports
        </label>
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input
            id="map-list-search"
            type="search"
            value={listQuery}
            onChange={(e) => setListQuery(e.target.value)}
            placeholder="Search title, barangay, or street"
            className="w-full rounded-xl border border-border bg-surface py-2.5 pl-9 pr-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            autoComplete="off"
          />
        </div>
        <button
          type="button"
          onClick={nearMe}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted/50"
        >
          <Crosshair className="h-4 w-4" aria-hidden />
          Near me — sort by distance
        </button>
      </div>

      <div className="mt-3 overflow-x-auto px-5">
        <div className="flex gap-2 pb-2">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setFilterAndSync(category)}
              className={cn(
                "whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition",
                filter === category
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "border border-transparent bg-surface-muted text-foreground/75 hover:bg-muted",
              )}
            >
              {category === "all" ? "All" : CATEGORY_LABEL[category]}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-2 px-5">
        <div className="inline-flex rounded-full border border-border bg-muted/40 p-0.5">
          {(["list", "map"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setView(option);
                track("map_view_mode", { mode: option });
              }}
              className={cn(
                "rounded-full px-4 py-2 text-xs font-semibold capitalize transition",
                view === option ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {loading ? <p className="mt-6 px-5 text-center text-sm text-muted-foreground">Loading…</p> : null}
      {loadError ? (
        <div className="mt-4 px-5">
          <LoadRetry message={loadError} onRetry={() => void load()} />
        </div>
      ) : null}

      {!loading && !loadError && view === "list" ? (
        <div className="mt-4 flex flex-col gap-5 px-5 pb-8">
          {filtered.length === 0 ? (
            <EmptyState
              title="No matching reports"
              subtitle="Try another category, clear search, or open the map view."
              action={
                <Link to="/report" className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
                  Report an issue
                </Link>
              }
            />
          ) : (
            filtered.map((report) => (
              <Link
                key={report.id}
                to={`/r/${report.id}`}
                className="block"
                onClick={() => {
                  setSelectedAndSync(report.id);
                  track("map_open_report", { id: report.id });
                }}
              >
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
                    <span className="text-xs text-muted-foreground">{report.confirmCount} confirms</span>
                  </div>
                </SoftCard>
              </Link>
            ))
          )}
        </div>
      ) : null}

      {!loading && !loadError && view === "map" ? (
        <>
          <div className="relative mx-5 mt-4 h-[56vh] overflow-hidden rounded-3xl border border-border">
            {tilesFailed ? (
              <div className="absolute inset-0 z-[400] flex items-center justify-center bg-muted/90 px-4 text-center">
                <p className="text-sm font-medium text-foreground">Map tiles could not load. Check your connection and try again.</p>
              </div>
            ) : null}
            <MapContainer center={[14.6, 121.03]} zoom={12} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
              <TileLayer
                attribution="© OpenStreetMap"
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                eventHandlers={{
                  tileerror: () => setTilesFailed(true),
                }}
              />
              {selectedReport ? <MapSelectionUpdater lat={selectedReport.geo.lat} lng={selectedReport.geo.lng} /> : null}
              {filtered.map((report) => (
                <Marker
                  key={report.id}
                  position={[report.geo.lat, report.geo.lng]}
                  icon={createReportMarkerIcon({
                    category: report.category,
                    severity: report.severity,
                    selected: report.id === selectedReportId,
                  })}
                  eventHandlers={{
                    click: () => {
                      setSelectedAndSync(report.id);
                      track("map_marker_select", { id: report.id });
                    },
                  }}
                />
              ))}
            </MapContainer>

            {selectedReport && (
              <div className="pointer-events-none absolute inset-x-3 bottom-3 z-[500]">
                <div className="pointer-events-auto rounded-3xl border border-border bg-surface/95 p-4 shadow-float backdrop-blur">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-muted-foreground">
                        {CATEGORY_LABEL[selectedReport.category]} · {selectedReport.barangay}
                      </div>
                      <div className="mt-0.5 truncate text-[15px] font-semibold">{selectedReport.title}</div>
                    </div>
                    <SeverityBadge severity={selectedReport.severity} />
                  </div>
                  <div className="mt-2.5 flex items-center justify-between gap-3">
                    <StatusBadge status={selectedReport.status} />
                    <span className="text-xs text-muted-foreground">{selectedReport.confirmCount} confirms</span>
                  </div>
                  <div className="mt-2 truncate text-xs text-muted-foreground">{selectedReport.address}</div>
                  <Link
                    to={`/r/${selectedReport.id}`}
                    className="mt-3 block w-full rounded-2xl bg-primary py-3 text-center text-sm font-semibold text-primary-foreground"
                  >
                    View case
                  </Link>
                </div>
              </div>
            )}
          </div>
          <p className="mt-3 px-5 pb-2 text-center text-xs text-muted-foreground">
            {filtered.length} active {filtered.length === 1 ? "report" : "reports"} on the map.
          </p>
        </>
      ) : null}

      <Drawer open={legendOpen} onOpenChange={setLegendOpen}>
        <DrawerContent
          className="mx-auto max-h-[88vh] w-full max-w-lg rounded-t-[20px] border border-border/60 bg-background"
          aria-describedby="map-legend-desc"
        >
          <DrawerHeader className="border-b border-border/60 pb-3 text-left">
            <DrawerTitle className="text-[20px] font-semibold tracking-tight">Map legend</DrawerTitle>
            <DrawerDescription id="map-legend-desc" className="text-left text-sm text-muted-foreground">
              How severity and status colors are used on the map and in lists.
            </DrawerDescription>
          </DrawerHeader>
          <div className="max-h-[min(70vh,520px)] space-y-6 overflow-y-auto overscroll-contain px-5 pb-10 pt-4">
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Severity</h3>
              <p className="mt-1 text-sm text-muted-foreground">Risk level from the report — not the same as agency workflow status.</p>
              <ul className="mt-3 space-y-3">
                <li className="flex items-start gap-3 rounded-xl border border-border bg-muted/20 px-3 py-3">
                  <SeverityBadge severity="low" />
                  <span className="text-sm text-foreground/90">Lower immediate risk; still track until closed.</span>
                </li>
                <li className="flex items-start gap-3 rounded-xl border border-border bg-muted/20 px-3 py-3">
                  <SeverityBadge severity="moderate" />
                  <span className="text-sm text-foreground/90">Affects safety or traffic; needs attention soon.</span>
                </li>
                <li className="flex items-start gap-3 rounded-xl border border-border bg-muted/20 px-3 py-3">
                  <SeverityBadge severity="high" />
                  <span className="text-sm text-foreground/90">Urgent hazard — deep potholes, flooding, open manholes.</span>
                </li>
              </ul>
            </section>
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status (sample)</h3>
              <ul className="mt-3 space-y-3">
                {STATUS_SAMPLES.map((st) => (
                  <li key={st} className="rounded-xl border border-border bg-muted/20 px-3 py-3">
                    <StatusBadge status={st} />
                    <p className="mt-2 text-sm text-muted-foreground">{STATUS_DESCRIPTION[st]}</p>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-muted-foreground">Full labels: {Object.values(STATUS_LABEL).slice(0, 6).join(" · ")}…</p>
            </section>
          </div>
        </DrawerContent>
      </Drawer>
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
