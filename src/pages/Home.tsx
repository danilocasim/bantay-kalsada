import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Plus, Sparkles, TriangleAlert } from "lucide-react";
import { InstallPrompt } from "@/components/InstallPrompt";
import { PageHeader, SoftCard, SeverityBadge, StatusBadge, EmptyState } from "@/components/ui-kit";
import { DEMO_USER_ID, getHomeInsight, listMyReports, listReports } from "@/lib/dataSource";
import { getHomeTitle } from "@/lib/reporting";
import { useSession } from "@/lib/session";
import { CATEGORY_LABEL, type Report } from "@/lib/types";

export default function Home() {
  const session = useSession();
  const [reports, setReports] = useState<Report[]>([]);
  const [myReports, setMyReports] = useState<Report[]>([]);
  const [insight, setInsight] = useState<{ area: string; summary: string } | null>(null);

  useEffect(() => {
    if (!session.isReady) return;
    listReports().then((items) => setReports(items));
    listMyReports(session.userId ?? DEMO_USER_ID).then((items) => setMyReports(items));
    getHomeInsight().then(setInsight);
  }, [session.isReady, session.userId]);

  const activeReports = reports.filter((report) => !["resolved", "community_verified"].includes(report.status)).slice(0, 3);
  const ownRecent = myReports.slice(0, 2);
  const title = getHomeTitle(activeReports[0]?.barangay ?? insight?.area);

  return (
    <div>
      <PageHeader title={title} subtitle="Report a hazard or track what is still unresolved." />
      <div className="px-5">
        <Link to="/report" className="flex items-center gap-3 p-4 rounded-3xl bg-primary text-primary-foreground shadow-float active:scale-[0.99] transition">
          <div className="h-11 w-11 rounded-2xl bg-primary-foreground/15 grid place-items-center">
            <Plus className="h-6 w-6" strokeWidth={2.5} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-[15px]">Report an issue</div>
            <div className="text-xs text-primary-foreground/80 mt-0.5">Photo + location + short note. Usually under 2 minutes.</div>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0" />
        </Link>

        <InstallPrompt />
      </div>

      <section className="px-5 mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold tracking-tight">Needs attention nearby</h2>
          <Link to="/map" className="text-xs font-medium text-primary">View map</Link>
        </div>
        <div className="mt-3 space-y-2.5">
          {activeReports.length === 0 ? (
            <EmptyState title="No active issues nearby" subtitle="New reports in your area will appear here first." />
          ) : (
            activeReports.map((report) => <ReportCard key={report.id} report={report} meta={`${report.confirmCount} confirms`} />)
          )}
        </div>
      </section>

      <section className="px-5 mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold tracking-tight">Your recent reports</h2>
          <Link to="/track" className="text-xs font-medium text-primary">See all</Link>
        </div>
        <div className="mt-3 space-y-2.5">
          {ownRecent.length === 0 ? (
            <SoftCard className="p-4 bg-primary-soft">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-2xl bg-primary text-primary-foreground grid place-items-center shrink-0">
                  <TriangleAlert className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold">You have not filed a report yet</div>
                  <p className="text-xs text-muted-foreground mt-1">When you submit one, this section becomes your personal tracking view.</p>
                </div>
              </div>
            </SoftCard>
          ) : (
            ownRecent.map((report) => <ReportCard key={report.id} report={report} meta={report.updatedLabel ?? "Recently updated"} />)
          )}
        </div>
      </section>

      {insight && (
        <section className="px-5 mt-6 pb-6">
          <SoftCard className="bg-gradient-to-br from-primary-soft to-surface">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold uppercase tracking-wide text-primary">Local insight</div>
                <p className="text-sm text-foreground/90 mt-1.5 leading-relaxed">{insight.summary}</p>
              </div>
            </div>
          </SoftCard>
        </section>
      )}
    </div>
  );
}

function ReportCard({ report, meta }: { report: Report; meta: string }) {
  return (
    <Link to={`/r/${report.id}`}>
      <SoftCard className="p-4 hover:bg-surface-muted/50 transition">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-xs text-muted-foreground">{CATEGORY_LABEL[report.category]} · {report.barangay}</div>
            <div className="font-medium text-[15px] mt-0.5 truncate">{report.title}</div>
          </div>
          <SeverityBadge severity={report.severity} />
        </div>
        <div className="mt-2.5 flex items-center justify-between gap-3">
          <StatusBadge status={report.status} />
          <span className="text-xs text-muted-foreground text-right">{meta}</span>
        </div>
      </SoftCard>
    </Link>
  );
}
