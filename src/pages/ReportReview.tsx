import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Check, ChevronLeft, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { AiAssistCard } from "@/components/AiAssistCard";
import { SoftCard, StatusBadge } from "@/components/ui-kit";
import { subscribeReport } from "@/lib/dataSource";
import { createReportMarkerIcon } from "@/lib/mapMarkers";
import { CATEGORY_LABEL, type Report } from "@/lib/types";

export default function ReportReview() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [report, setReport] = useState<Report | null>(null);

  useEffect(() => {
    if (!id) return;
    return subscribeReport(id, setReport);
  }, [id]);

  return (
    <div className="flex min-h-screen flex-col bg-background pt-safe pb-safe">
      <header className="flex shrink-0 items-center px-2 pt-2 pb-1">
        <button
          type="button"
          onClick={() => navigate("/home")}
          className="flex h-10 w-10 items-center justify-center rounded-full text-foreground hover:bg-muted"
          aria-label="Back to home"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2} />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8">
        <div className="pt-2 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-soft"
          >
            <Check className="h-7 w-7" strokeWidth={2.5} />
          </motion.div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">Report submitted</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Here is what we received. You can open the full case page next.</p>
        </div>

        {report && (
          <>
            {report.photoURLs[0] ? (
              <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-muted/20">
                <img src={report.photoURLs[0]} alt={report.title} className="max-h-64 w-full object-cover" />
              </div>
            ) : null}

            <div className="relative isolate z-0 mt-4 h-44 overflow-hidden rounded-2xl border border-border [&_.leaflet-container]:z-0">
              <MapContainer
                center={[report.geo.lat, report.geo.lng]}
                zoom={15}
                style={{ height: "100%", width: "100%" }}
                dragging={false}
                zoomControl={false}
                scrollWheelZoom={false}
              >
                <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker
                  position={[report.geo.lat, report.geo.lng]}
                  icon={createReportMarkerIcon({ category: report.category, severity: report.severity, selected: true })}
                />
              </MapContainer>
            </div>

            {(report.description?.trim() || report.aiSummary?.trim()) ? (
              <SoftCard className="mt-4">
                <div className="text-xs font-medium text-muted-foreground">Your note</div>
                <p className="mt-1.5 text-sm leading-relaxed text-foreground">{report.description?.trim() || report.aiSummary}</p>
              </SoftCard>
            ) : null}

            <SoftCard className="mt-4">
              <div className="text-xs font-medium text-muted-foreground">Case overview</div>
              <div className="mt-2 text-base font-semibold tracking-tight text-foreground">{report.title}</div>
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>{report.address ?? "Pinned location"}</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-muted-foreground">Category</div>
                  <div className="mt-0.5 font-medium text-foreground">{CATEGORY_LABEL[report.aiCategory ?? report.category]}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Current status</div>
                  <div className="mt-1">
                    <StatusBadge status={report.status} />
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="text-muted-foreground">What happens next</div>
                  <div className="mt-0.5 font-medium text-foreground">
                    {report.agencyName ? `Likely routing: ${report.agencyName}` : "The report will be reviewed and routed to the likely office."}
                  </div>
                </div>
              </div>
            </SoftCard>

            <AiAssistCard report={report} />
          </>
        )}

        <div className="mt-6 space-y-2.5">
          <button
            type="button"
            onClick={() => navigate(`/r/${id}`)}
            className="w-full rounded-2xl bg-primary py-4 text-[15px] font-semibold text-primary-foreground shadow-soft"
          >
            Track this case
          </button>
          <button
            type="button"
            onClick={() => navigate("/track")}
            className="w-full rounded-2xl border border-border bg-surface py-4 text-[15px] font-medium text-foreground hover:bg-muted"
          >
            View my reports
          </button>
        </div>
      </div>
    </div>
  );
}
