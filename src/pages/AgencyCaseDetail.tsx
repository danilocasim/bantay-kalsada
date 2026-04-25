import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { CATEGORY_LABEL, STATUS_LABEL, type Report, type ReportStatus } from "@/lib/types";
import { PageHeader, SoftCard, SeverityBadge, StatusBadge } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const ACTIONS: { status: ReportStatus; label: string }[] = [
  { status: "acknowledged", label: "Acknowledge" },
  { status: "scheduled", label: "Schedule Repair" },
  { status: "in_progress", label: "Mark In Progress" },
  { status: "resolved", label: "Mark Resolved" },
];

export default function AgencyCaseDetail() {
  const { id } = useParams();
  const [report, setReport] = useState<Report | null>(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!id) return;
    (async () => {
      const snap = await getDoc(doc(getDb(), "reports", id));
      if (snap.exists()) setReport({ id: snap.id, ...(snap.data() as Omit<Report, "id">) });
    })();
  }, [id]);

  async function setStatus(status: ReportStatus) {
    if (!id) return;
    try {
      await updateDoc(doc(getDb(), "reports", id), { status, updatedAt: serverTimestamp() });
      setReport((r) => (r ? { ...r, status } : r));
      toast({ title: `Status: ${STATUS_LABEL[status]}` });
    } catch (err) {
      toast({ title: "Update failed", description: (err as Error).message, variant: "destructive" });
    }
  }

  if (!report) return <div className="p-8 text-sm text-muted-foreground">Loading…</div>;

  return (
    <div>
      <PageHeader title="Road Hazard Case" subtitle={`#${report.id.slice(0, 8).toUpperCase()}`} back right={<StatusBadge status={report.status} />} />
      <div className="px-5 space-y-4 pb-12">
        <SoftCard>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">{report.title}</h3>
            <SeverityBadge severity={report.severity} />
          </div>
          <p className="text-sm text-muted-foreground mt-1">{CATEGORY_LABEL[report.category]} · {report.confirmCount} confirmations</p>
          {report.description && <p className="text-sm mt-3">{report.description}</p>}
        </SoftCard>

        {report.photoURLs.length > 0 && (
          <SoftCard className="p-3">
            <div className="grid grid-cols-2 gap-2">
              {report.photoURLs.map((u) => (
                <img key={u} src={u} alt="" className="rounded-xl h-32 w-full object-cover" />
              ))}
            </div>
          </SoftCard>
        )}

        <SoftCard>
          <h3 className="text-sm font-semibold">AI Summary</h3>
          <p className="text-sm text-muted-foreground mt-2 whitespace-pre-line">
            {report.aiSummary ?? "AI analysis is pending. The system will summarize evidence and recommend actions automatically."}
          </p>
        </SoftCard>

        <SoftCard>
          <h3 className="text-sm font-semibold">Update Status</h3>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {ACTIONS.map((a) => (
              <Button key={a.status} variant="outline" className="rounded-full" onClick={() => setStatus(a.status)}>
                {a.label}
              </Button>
            ))}
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Internal note (not visible publicly)"
            className="mt-3 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </SoftCard>
      </div>
    </div>
  );
}