import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { AiAssistCard } from "@/components/AiAssistCard";
import { EmptyState, PageHeader, SeverityBadge, SoftCard, StatusBadge } from "@/components/ui-kit";
import { getReport, updateAgencyReport } from "@/lib/dataSource";
import { useSession } from "@/lib/session";
import { CATEGORY_LABEL, type Report, type ReportStatus } from "@/lib/types";

const ACTIONS: Array<{ status: ReportStatus; label: string }> = [
  { status: "acknowledged", label: "Acknowledge" },
  { status: "scheduled", label: "Schedule work" },
  { status: "in_progress", label: "Work started" },
  { status: "resolved", label: "Mark resolved" },
];

export default function AgencyCaseDetail() {
  const { id } = useParams();
  const session = useSession();
  const [report, setReport] = useState<Report | null>(null);
  const [note, setNote] = useState("");
  const [proofPhotoURL, setProofPhotoURL] = useState("");
  const [overrideReason, setOverrideReason] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) getReport(id).then(setReport);
  }, [id]);

  if (!session.isDemo && session.isReady && !session.isAgency) {
    return <EmptyState title="Agency access required" subtitle="Only agency or moderator accounts can update case status." />;
  }

  if (!report) return <EmptyState title="Case not found" />;

  const updateStatus = async (status: ReportStatus) => {
    setSaving(true);
    try {
      const next = await updateAgencyReport(report.id, {
        status,
        proofPhotoURL,
        overrideReason,
      });
      setReport(next);
      if (status === "resolved") {
        setProofPhotoURL("");
        setOverrideReason("");
      }
      setNote("");
      toast.success(`${CATEGORY_LABEL[next.category]} case updated.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to update the case.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleProof = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProofPhotoURL(String(reader.result));
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <PageHeader title={report.title} subtitle={`${CATEGORY_LABEL[report.category]} · ${report.address}`} back />
      <div className="px-5 space-y-4 pb-8">
        <div className="flex gap-2 flex-wrap">
          <StatusBadge status={report.status} />
          <SeverityBadge severity={report.severity} />
        </div>

        <SoftCard>
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Public report summary</div>
          <p className="text-sm mt-1.5 leading-relaxed">{report.aiSummary || report.description}</p>
        </SoftCard>

        <AiAssistCard report={report} variant="agency" />

        <div>
          <h2 className="text-base font-semibold tracking-tight mb-2">Update status</h2>
          <div className="grid grid-cols-2 gap-2">
            {ACTIONS.map((action) => (
              <button
                key={action.status}
                onClick={() => void updateStatus(action.status)}
                disabled={saving}
                className={`p-3 rounded-2xl text-sm font-medium border transition ${report.status === action.status ? "bg-primary text-primary-foreground border-primary" : "bg-surface border-border hover:bg-muted"}`}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>

        <SoftCard>
          <div className="text-sm font-semibold">Resolution proof</div>
          <p className="text-xs text-muted-foreground mt-1">A proof photo is required by default before a case can be marked resolved.</p>
          <label className="mt-4 block rounded-2xl overflow-hidden border border-border bg-surface-muted cursor-pointer">
            {proofPhotoURL ? (
              <img src={proofPhotoURL} alt="Resolution proof preview" className="w-full h-44 object-cover" />
            ) : (
              <div className="h-40 grid place-items-center text-center px-6 text-muted-foreground bg-surface">
                <div>
                  <div className="text-sm font-semibold text-foreground">Upload after photo</div>
                  <div className="text-xs mt-1">Use this when the repair is complete and visible.</div>
                </div>
              </div>
            )}
            <input type="file" accept="image/*" capture="environment" onChange={handleProof} className="hidden" />
          </label>

          <div className="mt-4">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Manual override reason</label>
            <textarea
              value={overrideReason}
              onChange={(event) => setOverrideReason(event.target.value)}
              rows={3}
              placeholder="Only use this if proof cannot be uploaded yet. Explain why a field photo is unavailable."
              className="mt-2 w-full p-3 rounded-xl bg-surface-muted border border-transparent focus:border-primary focus:bg-surface outline-none text-sm resize-none"
            />
          </div>
        </SoftCard>

        <SoftCard>
          <div className="text-sm font-semibold">Internal note</div>
          <p className="text-xs text-muted-foreground mt-1">Internal notes stay separate from the public tracking timeline.</p>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            placeholder="Add an operational note for your team…"
            className="mt-3 w-full p-3 rounded-xl bg-surface-muted border border-transparent focus:border-primary focus:bg-surface outline-none text-sm resize-none"
          />
          <button
            onClick={() => {
              if (!note.trim()) return;
              toast.success("Internal note saved locally.");
              setNote("");
            }}
            disabled={!note.trim()}
            className="mt-3 w-full py-3 rounded-2xl bg-foreground text-background font-medium text-sm disabled:opacity-50"
          >
            Save internal note
          </button>
        </SoftCard>

        {report.resolutionProof?.photoURL && (
          <SoftCard>
            <div className="text-sm font-semibold">Existing public proof</div>
            <img src={report.resolutionProof.photoURL} alt="Existing proof" className="w-full h-40 object-cover rounded-2xl border border-border mt-3" />
            <div className="text-xs text-muted-foreground mt-3">Uploaded by {report.resolutionProof.uploadedBy ?? report.agencyName ?? "the handling team"}</div>
          </SoftCard>
        )}
      </div>
    </div>
  );
}
