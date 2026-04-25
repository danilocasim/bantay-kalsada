import { ListChecks, ShieldAlert } from "lucide-react";
import { SoftCard, SeverityBadge } from "@/components/ui-kit";
import { CATEGORY_LABEL, type Report } from "@/lib/types";

type AiAssistCardProps = {
  report: Pick<
    Report,
    "aiCategory" | "aiSeverity" | "aiSummary" | "aiOfficialReport" | "agencyName" | "routingConfidence" | "category" | "severity"
  >;
  variant?: "citizen" | "agency";
};

function getConfidenceLabel(confidence?: number) {
  if (typeof confidence !== "number") return null;
  if (confidence >= 0.75) return "High confidence";
  if (confidence >= 0.5) return "Medium confidence";
  return "Low confidence";
}

function getConfidencePercent(confidence?: number) {
  if (typeof confidence !== "number") return null;
  return `${Math.round(confidence * 100)}%`;
}

export function AiAssistCard({ report, variant = "citizen" }: AiAssistCardProps) {
  const category = report.aiCategory ?? report.category;
  const severity = report.aiSeverity ?? report.severity;
  const confidenceLabel = getConfidenceLabel(report.routingConfidence);
  const confidencePercent = getConfidencePercent(report.routingConfidence);

  if (!report.aiSummary && !report.aiOfficialReport && !report.agencyName && !report.aiCategory && !report.aiSeverity) {
    return null;
  }

  return (
    <SoftCard className="mt-4 border-border/90 bg-muted/20 shadow-sm" data-testid="ai-assist-card">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border bg-surface text-foreground shadow-sm">
          <ListChecks className="h-5 w-5" strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {variant === "agency" ? "Triage suggestions" : "Review suggestions"}
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-foreground/85">
            {variant === "agency"
              ? "Draft routing hints from the report text and image. Staff should confirm before acting."
              : "Automated hints for category and routing. Human review may change these before they are final."}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div>
          <div className="text-muted-foreground">Suggested category</div>
          <div className="mt-0.5 font-medium">{CATEGORY_LABEL[category]}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Suggested severity</div>
          <div className="mt-1">
            <SeverityBadge severity={severity} />
          </div>
        </div>
        {report.agencyName && (
          <div>
            <div className="text-muted-foreground">Likely office</div>
            <div className="mt-0.5 font-medium">{report.agencyName}</div>
          </div>
        )}
        {confidenceLabel && confidencePercent && (
          <div>
            <div className="text-muted-foreground">Routing confidence</div>
            <div className="mt-0.5 font-medium">
              {confidenceLabel} · {confidencePercent}
            </div>
          </div>
        )}
      </div>

      {report.aiSummary && (
        <div className="mt-4 rounded-2xl border border-border bg-surface px-4 py-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Suggested summary</div>
          <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">{report.aiSummary}</p>
        </div>
      )}

      {variant === "agency" && report.aiOfficialReport && (
        <div className="mt-4 rounded-2xl border border-border bg-surface px-4 py-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Incident draft</div>
          <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-foreground/90">{report.aiOfficialReport}</p>
        </div>
      )}

      <div className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
        <span>
          {variant === "agency"
            ? "Verify suggestions against field conditions before closing or escalating."
            : "Public status and agency actions can differ from these suggestions."}
        </span>
      </div>
    </SoftCard>
  );
}
