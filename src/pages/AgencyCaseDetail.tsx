import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { PageHeader, SoftCard, SeverityBadge, StatusBadge, EmptyState } from "@/components/ui-kit";
import { getReport, isDemoMode } from "@/lib/dataSource";
import { CATEGORY_LABEL, STATUS_LABEL, type Report, type ReportStatus } from "@/lib/types";

const NEXT_STATUSES: ReportStatus[] = ["acknowledged", "scheduled", "in_progress", "resolved"];

export default function AgencyCaseDetail() {
  const { id } = useParams();
  const [report, setReport] = useState<Report | null>(null);
  const [note, setNote] = useState("");
  useEffect(() => { if (id) getReport(id).then(setReport); }, [id]);

  if (!report) return <EmptyState title="Case not found" />;

  const updateStatus = (s: ReportStatus) => {
    if (isDemoMode) toast(`Demo: status would be set to ${STATUS_LABEL[s]}`);
    setReport({ ...report, status: s });
  };

  return (
    <div>
      <PageHeader title={report.title} subtitle={`${CATEGORY_LABEL[report.category]} · ${report.address}`} back />
      <div className="px-5 space-y-4">
        <div className="flex gap-2">
          <SeverityBadge severity={report.severity} />
          <StatusBadge status={report.status} />
        </div>
        <SoftCard>
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Reporter's note</div>
          <p className="text-sm mt-1.5 leading-relaxed">{report.description}</p>
        </SoftCard>
        {report.aiSummary && (
          <SoftCard className="bg-primary-soft">
            <div className="text-xs font-semibold uppercase tracking-wide text-primary">AI Summary</div>
            <p className="text-sm mt-1.5 leading-relaxed">{report.aiSummary}</p>
          </SoftCard>
        )}
        <div>
          <h3 className="text-base font-semibold tracking-tight mb-2">Update status</h3>
          <div className="grid grid-cols-2 gap-2">
            {NEXT_STATUSES.map((s) => (
              <button key={s} onClick={() => updateStatus(s)}
                className={`p-3 rounded-xl text-sm font-medium border transition ${report.status === s ? "bg-primary text-primary-foreground border-primary" : "bg-surface border-border hover:bg-muted"}`}>
                {STATUS_LABEL[s]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-base font-semibold tracking-tight mb-2">Internal note</h3>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Add a note for your team…"
            className="w-full p-3 rounded-xl bg-surface-muted border border-transparent focus:border-primary focus:bg-surface outline-none text-sm resize-none" />
          <button onClick={() => { toast.success("Note saved"); setNote(""); }} disabled={!note.trim()}
            className="mt-2 w-full py-3 rounded-xl bg-foreground text-background font-medium text-sm disabled:opacity-50">
            Save note
          </button>
        </div>
      </div>
    </div>
  );
}
