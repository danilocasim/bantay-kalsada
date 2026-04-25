import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader, SoftCard, StatusBadge, SeverityBadge, EmptyState } from "@/components/ui-kit";
import { DEMO_USER_ID, listMyReports } from "@/lib/dataSource";
import { useSession } from "@/lib/session";
import { CATEGORY_LABEL, type Report } from "@/lib/types";

export default function Track() {
  const session = useSession();
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState<"all" | "active" | "resolved">("all");
  useEffect(() => {
    if (!session.isReady) return;
    listMyReports(session.userId ?? DEMO_USER_ID).then(setReports);
  }, [session.isReady, session.userId]);

  const filtered = reports.filter((r) => {
    if (filter === "active") return !["resolved", "community_verified"].includes(r.status);
    if (filter === "resolved") return ["resolved", "community_verified"].includes(r.status);
    return true;
  });

  return (
    <div>
      <PageHeader title="Track" subtitle="Follow the progress of the reports you submitted." />
      <div className="px-5 flex gap-2 mb-3">
        {(["all", "active", "resolved"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium capitalize transition ${filter === f ? "bg-foreground text-background" : "bg-surface-muted text-foreground/70"}`}>
            {f}
          </button>
        ))}
      </div>
      <div className="px-5 space-y-2.5">
        {filtered.length === 0 ? (
          <EmptyState title="No reports yet" subtitle="Tap the + button to file your first report." />
        ) : filtered.map((r) => (
          <Link key={r.id} to={`/r/${r.id}`}>
            <SoftCard className="p-4 hover:bg-surface-muted/50 transition">
              <div className="flex items-start justify-between gap-3">
                <StatusBadge status={r.status} />
                <SeverityBadge severity={r.severity} />
              </div>
              <div className="mt-3 flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-muted-foreground">{CATEGORY_LABEL[r.category]}</div>
                  <div className="font-medium text-[15px] mt-0.5 truncate">{r.title}</div>
                </div>
              </div>
              <div className="mt-2.5 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{r.confirmCount} confirms</span>
                <span className="text-xs text-muted-foreground">{r.updatedLabel ?? "Recently updated"}</span>
              </div>
            </SoftCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
