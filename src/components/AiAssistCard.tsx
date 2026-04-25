import { ShieldAlert, Sparkles } from "lucide-react";
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
    <SoftCard className="mt-4 bg-primary-soft/70 border-primary/10" data-testid="ai-assist-card">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-2xl bg-primary text-primary-foreground grid place-items-center shrink-0">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold uppercase tracking-wide text-primary">
            {variant === "agency" ? "AI-assisted triage" : "AI-assisted review"}
          </div>
          <p className="text-sm text-foreground/85 mt-1.5 leading-relaxed">
            {variant === "agency"
              ? "Use this as a starting point for staff review. These suggestions can still be corrected."
              : "These are system suggestions to help review and routing. They are not final decisions."}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div>
          <div className="text-muted-foreground">Suggested category</div>
          <div className="font-medium mt-0.5">{CATEGORY_LABEL[category]}</div>
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
            <div className="font-medium mt-0.5">{report.agencyName}</div>
          </div>
        )}
        {confidenceLabel && confidencePercent && (
          <div>
            <div className="text-muted-foreground">Routing confidence</div>
            <div className="font-medium mt-0.5">{confidenceLabel} · {confidencePercent}</div>
          </div>
        )}
      </div>

      {report.aiSummary && (
        <div className="mt-4 rounded-2xl bg-surface border border-border px-4 py-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">AI summary</div>
          <p className="text-sm text-foreground/90 mt-1.5 leading-relaxed">{report.aiSummary}</p>
        </div>
      )}

      {variant === "agency" && report.aiOfficialReport && (
        <div className="mt-4 rounded-2xl bg-surface border border-border px-4 py-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">AI incident draft</div>
          <p className="text-sm text-foreground/90 mt-1.5 leading-relaxed whitespace-pre-line">{report.aiOfficialReport}</p>
        </div>
      )}

      <div className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
        <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0" />
        <span>{variant === "agency" ? "Staff should verify AI suggestions before acting on them." : "Routing and category suggestions may still change after human review."}</span>
      </div>
    </SoftCard>
  );
}
