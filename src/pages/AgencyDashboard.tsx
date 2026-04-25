import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { CATEGORY_LABEL, type Report } from "@/lib/types";
import { PageHeader, SoftCard, SeverityBadge, StatusBadge } from "@/components/ui-kit";

export default function AgencyDashboard() {
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(query(collection(getDb(), "reports"), orderBy("createdAt", "desc"), limit(50)));
        setReports(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Report, "id">) })));
      } catch {/* */}
    })();
  }, []);

  const counts = {
    new: reports.filter((r) => r.status === "submitted").length,
    high: reports.filter((r) => r.severity === "high").length,
    awaiting: reports.filter((r) => r.status === "routed").length,
    inProgress: reports.filter((r) => r.status === "in_progress").length,
    resolved: reports.filter((r) => r.status === "resolved").length,
  };

  return (
    <div>
      <PageHeader title="Agency Dashboard" subtitle="City Engineering Office" />
      <div className="px-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Stat label="New Reports" value={counts.new} tone="primary" />
          <Stat label="High Priority" value={counts.high} tone="status-urgent" />
          <Stat label="Awaiting Action" value={counts.awaiting} tone="status-pothole" />
          <Stat label="In Progress" value={counts.inProgress} tone="status-flood" />
        </div>

        <SoftCard>
          <h3 className="text-sm font-semibold mb-3">Active Cases</h3>
          <div className="space-y-3">
            {reports.slice(0, 10).map((r) => (
              <Link key={r.id} to={`/agency/case/${r.id}`} className="flex items-center gap-3 py-1">
                <div className="h-12 w-12 rounded-xl bg-surface-muted overflow-hidden shrink-0">
                  {r.photoURLs[0] && <img src={r.photoURLs[0]} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold truncate">{r.title}</span>
                    <SeverityBadge severity={r.severity} />
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{CATEGORY_LABEL[r.category]} · {r.confirmCount} confirmations</p>
                  <div className="mt-1"><StatusBadge status={r.status} /></div>
                </div>
              </Link>
            ))}
          </div>
        </SoftCard>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div
      className="rounded-2xl p-4 border border-border/70 shadow-soft"
      style={{ backgroundColor: `hsl(var(--${tone}) / 0.08)` }}
    >
      <div className="text-2xl font-semibold" style={{ color: `hsl(var(--${tone}))` }}>{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}