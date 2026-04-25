import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { collection, getDocs, limit, query, orderBy } from "firebase/firestore";
import { getDb, isFirebaseConfigured } from "@/lib/firebase";
import { CATEGORY_COLOR, type Category, type Report } from "@/lib/types";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const FILTERS: { key: "all" | Category | "urgent" | "resolved"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pothole", label: "Potholes" },
  { key: "flood", label: "Floods" },
  { key: "drainage", label: "Drainage" },
  { key: "urgent", label: "Urgent" },
  { key: "resolved", label: "Resolved" },
];

export default function PublicMap() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    (async () => {
      try {
        const snap = await getDocs(query(collection(getDb(), "reports"), orderBy("createdAt", "desc"), limit(200)));
        setReports(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Report, "id">) })));
      } catch {
        /* empty */
      }
    })();
  }, []);

  const visible = useMemo(() => {
    return reports.filter((r) => {
      if (filter === "urgent" && r.severity !== "high") return false;
      if (filter === "resolved" && r.status !== "resolved" && r.status !== "community_verified") return false;
      if (filter !== "all" && filter !== "urgent" && filter !== "resolved" && r.category !== filter) return false;
      if (search && !`${r.title} ${r.address ?? ""} ${r.barangay ?? ""}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [reports, filter, search]);

  // Default to Manila if no data
  const center: [number, number] = visible[0]
    ? [visible[0].geo.lat, visible[0].geo.lng]
    : [14.5995, 120.9842];

  return (
    <div className="relative h-[100dvh] w-full">
      <MapContainer center={center} zoom={13} className="h-full w-full" zoomControl={false}>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {visible.map((r) => (
          <CircleMarker
            key={r.id}
            center={[r.geo.lat, r.geo.lng]}
            radius={9}
            pathOptions={{
              color: CATEGORY_COLOR[r.category as Category] ?? "#0A84FF",
              fillColor: CATEGORY_COLOR[r.category as Category] ?? "#0A84FF",
              fillOpacity: 0.8,
              weight: 2,
            }}
          >
            <Popup>
              <div className="min-w-[180px]">
                <div className="text-sm font-semibold">{r.title}</div>
                <div className="text-xs text-muted-foreground">{r.barangay ?? r.address}</div>
                <Link to={`/r/${r.id}`} className="text-xs text-primary font-medium mt-1 inline-block">View Details</Link>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Search */}
      <div className="absolute top-0 inset-x-0 pt-safe px-4 pt-4 z-[1000]">
        <div className="glass rounded-full shadow-float border border-border/60 flex items-center gap-2 px-4 py-2 max-w-md mx-auto">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search road, barangay, or city"
            className="border-0 bg-transparent h-9 px-0 focus-visible:ring-0 shadow-none"
          />
        </div>
        <div className="mt-3 max-w-md mx-auto flex gap-2 overflow-x-auto no-scrollbar">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition",
                filter === f.key
                  ? "bg-foreground text-background border-foreground"
                  : "glass border-border/60 text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}