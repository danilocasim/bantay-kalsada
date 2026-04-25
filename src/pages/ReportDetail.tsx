import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MapContainer, TileLayer, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, ThumbsUp, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, SoftCard, SeverityBadge, StatusBadge, EmptyState } from "@/components/ui-kit";
import { getReport } from "@/lib/dataSource";
import { CATEGORY_COLOR, CATEGORY_LABEL, STATUS_LABEL, type Report, type ReportStatus } from "@/lib/types";

export default function ReportDetail() {
  const { id } = useParams();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { if (!id) return; getReport(id).then((r) => { setReport(r); setLoading(false); }); }, [id]);

  if (loading) return <div className="p-10 text-center text-sm text-muted-foreground">Loading…</div>;
  if (!report) return <EmptyState title="Report not found" subtitle="This report may have been removed." />;

  const timeline: { status: ReportStatus; at: string; note: string }[] = [
    { status: "submitted", at: "3 days ago", note: "Report filed by reporter." },
    { status: "ai_reviewed", at: "3 days ago", note: "AI classified as " + CATEGORY_LABEL[report.aiCategory ?? report.category] },
    { status: "routed", at: "2 days ago", note: "Routed to " + (report.agencyName ?? "agency") },
    ...((["acknowledged", "scheduled", "in_progress", "resolved"] as ReportStatus[]).includes(report.status)
      ? [{ status: report.status, at: "Today", note: STATUS_LABEL[report.status] + " by agency" }]
      : []),
  ];

  return (
    <div>
      <PageHeader title={report.title} subtitle={`${CATEGORY_LABEL[report.category]} · ${report.barangay}, ${report.city}`} back />
      <div className="px-5">
        <div className="rounded-2xl overflow-hidden border border-border h-48">
          <MapContainer center={[report.geo.lat, report.geo.lng]} zoom={15} style={{ height: "100%", width: "100%" }} dragging={false} zoomControl={false} scrollWheelZoom={false}>
            <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <CircleMarker center={[report.geo.lat, report.geo.lng]} radius={11}
              pathOptions={{ color: CATEGORY_COLOR[report.category], fillColor: CATEGORY_COLOR[report.category], fillOpacity: 0.6 }} />
          </MapContainer>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />{report.address}
        </div>
        <div className="mt-4 flex items-center gap-2">
          <SeverityBadge severity={report.severity} />
          <StatusBadge status={report.status} />
        </div>
        {report.aiSummary && (
          <SoftCard className="mt-5 bg-gradient-to-br from-primary-soft to-surface">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-primary">AI Summary</div>
                <p className="text-sm text-foreground/90 mt-1 leading-relaxed">{report.aiSummary}</p>
              </div>
            </div>
          </SoftCard>
        )}
        <SoftCard className="mt-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Reporter's note</div>
          <p className="text-sm text-foreground/90 mt-1.5 leading-relaxed">{report.description}</p>
        </SoftCard>
        <div className="mt-5">
          <h3 className="text-base font-semibold tracking-tight mb-3">Status timeline</h3>
          <div className="space-y-3">
            {timeline.map((e, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                  {i < timeline.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                </div>
                <div className="pb-3 -mt-1">
                  <div className="text-sm font-medium">{STATUS_LABEL[e.status]}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{e.at} · {e.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <button onClick={() => toast.success(`Confirmed — ${report.confirmCount + 1} confirms`)}
          className="mt-5 w-full py-4 rounded-2xl bg-surface border border-border font-medium text-[15px] hover:bg-muted transition flex items-center justify-center gap-2">
          <ThumbsUp className="h-4 w-4" />I've seen this too ({report.confirmCount})
        </button>
      </div>
    </div>
  );
}
