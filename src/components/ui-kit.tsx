import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { STATUS_LABEL, type ReportStatus, type Severity } from "@/lib/types";

export function PageHeader({
  title,
  subtitle,
  back,
  right,
}: {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: ReactNode;
}) {
  const navigate = useNavigate();
  return (
    <header className="pt-safe px-5 pt-4 pb-3 flex items-start gap-3">
      {back && (
        <button
          aria-label="Back"
          onClick={() => navigate(-1)}
          className="h-9 w-9 -ml-1 rounded-full grid place-items-center text-foreground/80 hover:bg-muted active:scale-95 transition"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
      <div className="flex-1 min-w-0">
        <h1 className="text-[26px] leading-tight font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
      {right}
    </header>
  );
}

export function SoftCard({
  className,
  children,
  as: Tag = "div",
}: {
  className?: string;
  children: ReactNode;
  as?: keyof JSX.IntrinsicElements;
}) {
  return (
    <Tag
      className={cn(
        "bg-surface rounded-2xl border border-border/70 shadow-soft p-5",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

const SEVERITY_CLASS: Record<Severity, string> = {
  high: "bg-status-urgent/10 text-status-urgent",
  moderate: "bg-status-pothole/10 text-status-pothole",
  low: "bg-status-resolved/10 text-status-resolved",
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  const label = severity === "high" ? "High Risk" : severity === "moderate" ? "Moderate" : "Low";
  return (
    <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold", SEVERITY_CLASS[severity])}>
      {label}
    </span>
  );
}

const STATUS_TONE: Record<ReportStatus, string> = {
  submitted: "bg-muted text-muted-foreground",
  ai_reviewed: "bg-primary-soft text-primary",
  verified: "bg-primary-soft text-primary",
  routed: "bg-primary-soft text-primary",
  acknowledged: "bg-primary-soft text-primary",
  scheduled: "bg-status-pothole/10 text-status-pothole",
  in_progress: "bg-status-pothole/10 text-status-pothole",
  resolved: "bg-status-resolved/10 text-status-resolved",
  community_verified: "bg-status-resolved/10 text-status-resolved",
  reopened: "bg-status-urgent/10 text-status-urgent",
};

export function StatusBadge({ status }: { status: ReportStatus }) {
  return (
    <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold", STATUS_TONE[status])}>
      {STATUS_LABEL[status]}
    </span>
  );
}

export function EmptyState({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="text-center py-16 px-6">
      <div className="mx-auto mb-5 h-20 w-20 rounded-3xl bg-primary-soft grid place-items-center text-primary text-3xl">
        ✦
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {subtitle && <p className="text-sm text-muted-foreground mt-1.5 max-w-xs mx-auto">{subtitle}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}