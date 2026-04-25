import { PageHeader, SoftCard, SeverityBadge } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { CATEGORY_LABEL, type Report } from "@/lib/types";
import { Link } from "react-router-dom";

export default function Urgency() {
  const [reports, setReports] = useState<Report[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(query(collection(getDb(), "reports"), where("severity", "==", "high"), orderBy("createdAt", "desc"), limit(50)));
        setReports(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Report, "id">) })));
      } catch {/* */}
    })();
  }, []);

  return (
    <div>
      <PageHeader title="Urgent Near You" subtitle="Help confirm issues that need faster attention." back />
      <div className="px-5 space-y-3">
        {reports.map((r) => (
          <SoftCard key={r.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold truncate">{r.title}</h3>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{CATEGORY_LABEL[r.category]} · {r.barangay ?? "Nearby"}</p>
              </div>
              <SeverityBadge severity={r.severity} />
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">{r.confirmCount} confirmations</span>
              <div className="flex gap-2">
                <Button size="sm" className="rounded-full">Confirm Issue</Button>
                <Link to={`/r/${r.id}`}><Button size="sm" variant="outline" className="rounded-full">View</Button></Link>
              </div>
            </div>
          </SoftCard>
        ))}
      </div>
    </div>
  );
}