import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Sparkles, TrendingUp } from "lucide-react";
import { PageHeader, SoftCard, SeverityBadge, StatusBadge } from "@/components/ui-kit";
import { useAuth } from "@/contexts/AuthContext";
import { listReports, getHomeInsight } from "@/lib/dataSource";
import { CATEGORY_LABEL, type Report } from "@/lib/types";
import { DEMO_INSIGHT } from "@/lib/demoData";

export default function Home() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [insight, setInsight] = useState(DEMO_INSIGHT);

  useEffect(() => {
    listReports().then((r) => setReports(r.slice(0, 4)));
    getHomeInsight().then(setInsight);
  }, []);

  const greeting = user?.displayName ? `Hi, ${user.displayName.split(" ")[0]}` : "Hello there";

  return (
    <div>
      <PageHeader title={greeting} subtitle="What's happening on the roads near you?" />
      <div className="px-5">
        <Link to="/report" className="flex items-center gap-3 p-4 rounded-2xl bg-primary text-primary-foreground shadow-float active:scale-[0.99] transition">
          <div className="h-11 w-11 rounded-2xl bg-primary-foreground/15 grid place-items-center">
            <Plus className="h-6 w-6" strokeWidth={2.5} />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-[15px]">Report an issue</div>
            <div className="text-xs text-primary-foreground/80">Photo · location · 2 minutes</div>
          </div>
        </Link>
      </div>
      <div className="px-5 mt-5">
        <SoftCard className="bg-gradient-to-br from-primary-soft to-surface">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-primary">AI Insight</span>
                <span className="text-xs text-muted-foreground">· {insight.area}</span>
                {insight.trend === "up" && <TrendingUp className="h-3.5 w-3.5 text-status-urgent" />}
              </div>
              <p className="text-sm text-foreground/90 mt-1.5 leading-relaxed">{insight.summary}</p>
            </div>
          </div>
        </SoftCard>
      </div>
      <div className="px-5 mt-7 flex items-center justify-between">
        <h2 className="text-base font-semibold tracking-tight">Recent in your area</h2>
        <Link to="/map" className="text-xs font-medium text-primary">View map</Link>
      </div>
      <div className="px-5 mt-3 space-y-2.5">
        {reports.map((r) => (
          <Link key={r.id} to={`/r/${r.id}`}>
            <SoftCard className="p-4 hover:bg-surface-muted/50 transition">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-muted-foreground">{CATEGORY_LABEL[r.category]} · {r.barangay}</div>
                  <div className="font-medium text-[15px] mt-0.5 truncate">{r.title}</div>
                </div>
                <SeverityBadge severity={r.severity} />
              </div>
              <div className="mt-2.5 flex items-center justify-between">
                <StatusBadge status={r.status} />
                <span className="text-xs text-muted-foreground">{r.confirmCount} confirms</span>
              </div>
            </SoftCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
