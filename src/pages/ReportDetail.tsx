import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Check, Mail, MapPin, ShieldAlert, Sparkles, ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import { AiAssistCard } from "@/components/AiAssistCard";
import { EmptyState, PageHeader, SeverityBadge, SoftCard, StatusBadge } from "@/components/ui-kit";
import { DEMO_USER_ID, confirmReport, getReport, reopenReport, subscribeReport, subscribeStatusEvents } from "@/lib/dataSource";
import { buildEscalationMailto, dismissEscalationSuggestion, getEscalationActionState, getUnresolvedDays, isEscalationEligible, markEscalationPrepared, shouldShowEscalationSuggestion } from "@/lib/escalation";
import { createReportMarkerIcon } from "@/lib/mapMarkers";
import { useSession } from "@/lib/session";
import { CATEGORY_LABEL, STATUS_LABEL, type Report, type StatusEvent } from "@/lib/types";

export default function ReportDetail() {
  const { id } = useParams();
  const session = useSession();
  const [report, setReport] = useState<Report | null>(null);
  const [events, setEvents] = useState<StatusEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [escalationActionState, setEscalationActionState] = useState<"none" | "dismissed" | "prepared">("none");

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    const unsubscribeReport = subscribeReport(id, (nextReport) => {
      setReport(nextReport);
      setLoading(false);
    });
    const unsubscribeEvents = subscribeStatusEvents(id, setEvents);

    return () => {
      unsubscribeReport();
      unsubscribeEvents();
    };
  }, [id, session.userId]);

  useEffect(() => {
    if (!report) return;
    setEscalationActionState(getEscalationActionState(report.id));
  }, [report]);

  if (loading) return <div className="p-10 text-center text-sm text-muted-foreground">Loading…</div>;
  if (!report) return <EmptyState title="Report not found" subtitle="This report may have been removed." />;

  const viewerUid = session.userId ?? DEMO_USER_ID;
  const isOwnReport = report.reporterUid === viewerUid;
  const isConfirmedByViewer = report.confirmedBy?.includes(viewerUid) ?? false;
  const confirmationContext = isOwnReport ? "You reported this" : isConfirmedByViewer ? "You confirmed this" : null;
  const unresolvedDays = getUnresolvedDays(report);
  const escalationEligible = isEscalationEligible(report, viewerUid);
  const showEscalationCard = shouldShowEscalationSuggestion(report, viewerUid);
  const escalationMailto = buildEscalationMailto(report, typeof window !== "undefined" ? window.location.origin : undefined);

  const handleConfirm = async () => {
    const result = await confirmReport(report.id, viewerUid);

    if (!result.ok) {
      if (result.reason === "self") toast.error("You can’t confirm your own report.");
      if (result.reason === "duplicate") {
        const refreshed = await getReport(report.id);
        if (refreshed) setReport(refreshed);
        toast("Your confirmation has already been counted.");
      }
      return;
    }

    setReport(result.report);
    toast.success("Issue confirmed.");
  };

  const handleReopen = async () => {
    const next = await reopenReport(report.id);
    if (!next) return;
    setReport(next);
    toast.success("Marked as still unresolved.");
  };

  const handleEscalationDismiss = () => {
    dismissEscalationSuggestion(report.id);
    setEscalationActionState("dismissed");
    toast("We’ll hide this suggestion for now.");
  };

  const handleEscalationPrepare = () => {
    markEscalationPrepared(report.id);
    setEscalationActionState("prepared");
    window.location.href = escalationMailto;
    toast.success("Prepared an escalation email draft.");
  };

  const canReopen = ["resolved", "community_verified"].includes(report.status);

  return (
    <div>
      <PageHeader title={report.title} subtitle={`${CATEGORY_LABEL[report.category]} · ${report.barangay}, ${report.city}`} back />
      <div className="px-5 pb-8">
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={report.status} />
          <SeverityBadge severity={report.severity} />
          {isOwnReport && <span className="px-2.5 py-1 rounded-full bg-surface-muted text-muted-foreground text-xs font-semibold">Reporter</span>}
          {isConfirmedByViewer && <span className="px-2.5 py-1 rounded-full bg-status-resolved/10 text-status-resolved text-xs font-semibold">Confirmed by you</span>}
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span>{report.address}</span>
        </div>

        {report.photoURLs[0] && (
          <div className="mt-5 rounded-3xl overflow-hidden border border-border bg-surface">
            <img src={report.photoURLs[0]} alt={report.title} className="w-full h-56 object-cover" />
          </div>
        )}

        <SoftCard className="mt-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Public summary</div>
          <p className="text-sm text-foreground/90 mt-1.5 leading-relaxed">{report.aiSummary || report.description}</p>
          <div className="text-xs text-muted-foreground mt-3">
            {report.confirmCount} community confirmations{confirmationContext ? ` • ${confirmationContext}` : ""}
          </div>
        </SoftCard>

        <AiAssistCard report={report} />

        <SoftCard className={`mt-4 ${isConfirmedByViewer ? "bg-status-resolved/10 border-status-resolved/20" : isOwnReport ? "bg-surface-muted/60" : "bg-primary-soft"}`}>
          <div className="flex items-start gap-3">
            <div className={`h-10 w-10 rounded-2xl grid place-items-center shrink-0 ${isConfirmedByViewer ? "bg-status-resolved text-white" : isOwnReport ? "bg-surface text-primary border border-border" : "bg-primary text-primary-foreground"}`}>
              {isConfirmedByViewer ? <Check className="h-5 w-5" /> : isOwnReport ? <MapPin className="h-5 w-5" /> : <ThumbsUp className="h-5 w-5" />}
            </div>
            <div className="min-w-0 flex-1">
              {isOwnReport ? (
                <>
                  <div className="text-sm font-semibold">You reported this issue</div>
                  <p className="text-xs text-muted-foreground mt-1">Nearby residents can confirm it if they saw the same problem recently.</p>
                  <div className="mt-3 rounded-2xl bg-surface px-3.5 py-3 text-sm text-foreground/80 border border-border">
                    Waiting for community confirmations from nearby residents.
                  </div>
                </>
              ) : isConfirmedByViewer ? (
                <>
                  <div className="text-sm font-semibold">Confirmed by you</div>
                  <p className="text-xs text-muted-foreground mt-1">Your confirmation has been counted. You can still reopen the case later if it is falsely resolved.</p>
                  <div className="mt-3 rounded-2xl bg-surface px-3.5 py-3 text-sm text-status-resolved border border-status-resolved/20 font-medium flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    <span>Your confirmation has already been counted.</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-sm font-semibold">Confirm issue</div>
                  <p className="text-xs text-muted-foreground mt-1">Use this if you saw the same issue recently and it is still affecting the area.</p>
                  <button onClick={handleConfirm} className="mt-3 w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm shadow-soft">
                    Confirm issue
                  </button>
                </>
              )}
            </div>
          </div>
        </SoftCard>

        {canReopen && (
          <SoftCard className="mt-4 border-status-urgent/20 bg-status-urgent/5">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-2xl bg-status-urgent/15 text-status-urgent grid place-items-center shrink-0">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold">Still unresolved?</div>
                <p className="text-xs text-muted-foreground mt-1">If the issue is not actually fixed, the community can reopen the case.</p>
                <button onClick={handleReopen} className="mt-3 w-full py-3.5 rounded-2xl bg-surface border border-status-urgent/20 font-semibold text-sm text-status-urgent">
                  Still unresolved
                </button>
              </div>
            </div>
          </SoftCard>
        )}

        <SoftCard className="mt-4">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold uppercase tracking-wide text-primary">What happens next</div>
              <p className="text-sm text-foreground/85 mt-1.5 leading-relaxed">
                {report.status === "submitted"
                  ? "The report is waiting for review and likely routing."
                  : report.status === "routed"
                    ? `The report was routed to ${report.agencyName ?? "the likely office"}.`
                    : report.status === "acknowledged"
                      ? `${report.agencyName ?? "The handling team"} acknowledged the case.`
                      : report.status === "resolved"
                        ? "The case was marked resolved. Review the proof below before assuming the issue is fixed."
                        : `${STATUS_LABEL[report.status]} is the latest public update for this case.`}
              </p>
            </div>
          </div>
        </SoftCard>

        {showEscalationCard && (
          <SoftCard className="mt-4 border-primary/15 bg-primary-soft/60">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-2xl bg-primary text-primary-foreground grid place-items-center shrink-0">
                <Mail className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold">This report is still unresolved after {unresolvedDays} days</div>
                <p className="text-xs text-muted-foreground mt-1">Would you like to prepare an escalation email to 8888? We&apos;ll prefill the report details for you.</p>
                {!import.meta.env.VITE_8888_EMAIL && (
                  <p className="text-[11px] text-muted-foreground mt-2">If the 8888 recipient isn&apos;t prefilled, you can still add it before sending the draft.</p>
                )}
                <div className="mt-3 flex gap-2">
                  <button onClick={handleEscalationPrepare} className="flex-1 py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm shadow-soft">
                    Prepare 8888 email
                  </button>
                  <button onClick={handleEscalationDismiss} className="px-4 py-3.5 rounded-2xl bg-surface border border-border text-sm font-medium text-foreground">
                    Not now
                  </button>
                </div>
              </div>
            </div>
          </SoftCard>
        )}

        {escalationActionState === "prepared" && escalationEligible && !showEscalationCard && (
          <SoftCard className="mt-4 border-status-resolved/20 bg-status-resolved/10">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-2xl bg-status-resolved text-white grid place-items-center shrink-0">
                <Check className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold">8888 escalation draft prepared</div>
                <p className="text-xs text-muted-foreground mt-1">You can open the email draft again anytime if you still want to escalate this unresolved case.</p>
                <button onClick={handleEscalationPrepare} className="mt-3 w-full py-3.5 rounded-2xl bg-surface border border-status-resolved/20 font-semibold text-sm text-status-resolved">
                  Open draft again
                </button>
              </div>
            </div>
          </SoftCard>
        )}

        <SoftCard className="mt-4">
          <div className="text-base font-semibold tracking-tight">Status timeline</div>
          <div className="mt-4 space-y-3">
            {events.map((event, index) => (
              <div key={event.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                  {index < events.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                </div>
                <div className="pb-3 -mt-1 min-w-0">
                  <div className="text-sm font-medium">{STATUS_LABEL[event.status]}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{event.atLabel}</div>
                  <div className="text-sm text-foreground/85 mt-1 leading-relaxed">{event.note}</div>
                </div>
              </div>
            ))}
          </div>
        </SoftCard>

        <SoftCard className="mt-4">
          <div className="text-base font-semibold tracking-tight">Resolution proof</div>
          {report.resolutionProof?.photoURL ? (
            <div className="mt-3">
              <img src={report.resolutionProof.photoURL} alt="Resolution proof" className="w-full h-48 object-cover rounded-2xl border border-border" />
              <div className="mt-3 text-sm font-medium">Proof uploaded by {report.resolutionProof.uploadedBy ?? "the handling team"}</div>
              <div className="text-xs text-muted-foreground mt-1">{report.resolutionProof.uploadedAtLabel ?? "Recently"}</div>
            </div>
          ) : report.resolutionProof?.overrideReason ? (
            <div className="mt-3 rounded-2xl border border-status-pothole/20 bg-status-pothole/5 px-4 py-4">
              <div className="text-sm font-semibold text-foreground">Resolved with manual override</div>
              <p className="text-sm text-muted-foreground mt-1">{report.resolutionProof.overrideReason}</p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">No public proof has been uploaded yet.</p>
          )}
        </SoftCard>

        <div className="mt-4 rounded-3xl overflow-hidden border border-border h-48">
          <MapContainer center={[report.geo.lat, report.geo.lng]} zoom={15} style={{ height: "100%", width: "100%" }} dragging={false} zoomControl={false} scrollWheelZoom={false}>
            <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker
              position={[report.geo.lat, report.geo.lng]}
              icon={createReportMarkerIcon({ category: report.category, severity: report.severity, selected: true })}
            />
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
