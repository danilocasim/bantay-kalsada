import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, increment, runTransaction, serverTimestamp, setDoc } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { CATEGORY_LABEL, STATUS_LABEL, type Report, type ReportStatus } from "@/lib/types";
import { PageHeader, SoftCard, SeverityBadge, StatusBadge } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Share2 } from "lucide-react";

const TIMELINE: ReportStatus[] = [
  "submitted",
  "ai_reviewed",
  "verified",
  "routed",
  "acknowledged",
  "scheduled",
  "in_progress",
  "resolved",
  "community_verified",
];

export default function ReportDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [report, setReport] = useState<Report | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const snap = await getDoc(doc(getDb(), "reports", id));
      if (snap.exists()) setReport({ id: snap.id, ...(snap.data() as Omit<Report, "id">) });
    })();
  }, [id]);

  async function confirm() {
    if (!user || !id) return;
    try {
      const db = getDb();
      await runTransaction(db, async (tx) => {
        const cRef = doc(db, "reports", id, "confirmations", user.uid);
        const c = await tx.get(cRef);
        if (c.exists()) throw new Error("Already confirmed");
        tx.set(cRef, { at: serverTimestamp() });
        tx.update(doc(db, "reports", id), { confirmCount: increment(1) });
      });
      toast({ title: "Confirmed", description: "Thanks for helping verify this issue." });
      const snap = await getDoc(doc(db, "reports", id));
      if (snap.exists()) setReport({ id: snap.id, ...(snap.data() as Omit<Report, "id">) });
    } catch (err) {
      toast({ title: "Could not confirm", description: (err as Error).message, variant: "destructive" });
    }
  }

  if (!report) return <div className="p-8 text-sm text-muted-foreground">Loading…</div>;

  const currentIdx = TIMELINE.indexOf(report.status);

  return (
    <div>
      <PageHeader title={report.title} subtitle={report.barangay ?? report.address ?? "Public report"} back right={<StatusBadge status={report.status} />} />
      <div className="px-5 space-y-4 pb-10">
        {report.photoURLs[0] && (
          <SoftCard className="p-0 overflow-hidden">
            <img src={report.photoURLs[0]} alt={report.title} className="w-full h-56 object-cover" />
            <div className="p-4 flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded-full bg-surface-muted">{CATEGORY_LABEL[report.category]}</span>
              <SeverityBadge severity={report.severity} />
            </div>
          </SoftCard>
        )}

        <SoftCard>
          <h3 className="text-sm font-semibold">Tracking Timeline</h3>
          <ol className="mt-4 space-y-3">
            {TIMELINE.map((s, i) => {
              const active = i <= currentIdx;
              return (
                <li key={s} className="flex items-center gap-3">
                  <span className={`h-2.5 w-2.5 rounded-full ${active ? "bg-primary" : "bg-muted"}`} />
                  <span className={`text-sm ${active ? "text-foreground font-medium" : "text-muted-foreground"}`}>{STATUS_LABEL[s]}</span>
                </li>
              );
            })}
          </ol>
        </SoftCard>

        <SoftCard>
          <h3 className="text-sm font-semibold">Community</h3>
          <p className="text-sm text-muted-foreground mt-1">{report.confirmCount} people confirmed this issue</p>
          <div className="mt-3 flex gap-2">
            <Button onClick={confirm} className="flex-1 rounded-full h-11 font-semibold">Confirm Issue</Button>
            <Button variant="outline" onClick={confirm} className="flex-1 rounded-full h-11">Still Unresolved</Button>
          </div>
        </SoftCard>

        <SoftCard>
          <h3 className="text-sm font-semibold">Agency</h3>
          <p className="text-sm mt-1">{report.agencyName ?? "City Engineering Office"}</p>
        </SoftCard>

        <Button variant="outline" className="w-full h-12 rounded-full" onClick={() => navigator.share?.({ title: report.title, url: location.href })}>
          <Share2 className="h-4 w-4 mr-1" /> Share Report
        </Button>
      </div>
    </div>
  );
}