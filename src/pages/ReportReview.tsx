import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { CATEGORY_LABEL, type Report } from "@/lib/types";
import { PageHeader, SoftCard, SeverityBadge } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";

export default function ReportReview() {
  const { id } = useParams();
  const [report, setReport] = useState<Report | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    (async () => {
      const snap = await getDoc(doc(getDb(), "reports", id));
      if (snap.exists()) setReport({ id: snap.id, ...(snap.data() as Omit<Report, "id">) });
    })();
  }, [id]);

  if (!report) return <div className="p-8 text-sm text-muted-foreground">Loading…</div>;

  return (
    <div className="pb-32">
      <PageHeader title="Review Your Report" back />
      <div className="px-5 space-y-4">
        <SoftCard>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Issue Summary</h3>
            <SeverityBadge severity={report.severity} />
          </div>
          <p className="text-sm text-foreground mt-2">{CATEGORY_LABEL[report.category]}</p>
          {report.description && <p className="text-sm text-muted-foreground mt-1">{report.description}</p>}
        </SoftCard>

        <SoftCard>
          <h3 className="text-sm font-semibold">Location</h3>
          <div className="mt-2 rounded-xl bg-surface-muted h-32 grid place-items-center text-xs text-muted-foreground">
            {report.geo.lat.toFixed(5)}, {report.geo.lng.toFixed(5)}
          </div>
        </SoftCard>

        {report.photoURLs.length > 0 && (
          <SoftCard>
            <h3 className="text-sm font-semibold">Evidence</h3>
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {report.photoURLs.map((u) => (
                <img key={u} src={u} alt="evidence" className="h-24 w-24 rounded-xl object-cover" />
              ))}
            </div>
          </SoftCard>
        )}

        <SoftCard>
          <h3 className="text-sm font-semibold">Responsible Office</h3>
          <p className="text-sm mt-1">{report.agencyName ?? "City Engineering Office"}</p>
          <p className="text-xs text-muted-foreground mt-1">Final responsibility may be verified by the receiving office.</p>
        </SoftCard>

        <SoftCard>
          <h3 className="text-sm font-semibold">Generated Official Report</h3>
          <p className="text-sm text-muted-foreground mt-2 whitespace-pre-line">
            {report.aiOfficialReport ??
              `Subject: ${CATEGORY_LABEL[report.category]} report\n\nA ${CATEGORY_LABEL[report.category].toLowerCase()} has been reported at ${report.geo.lat.toFixed(5)}, ${report.geo.lng.toFixed(5)}. Recommended action: site inspection and repair scheduling.`}
          </p>
        </SoftCard>
      </div>
      <div className="fixed bottom-0 inset-x-0 px-5 pb-safe pt-3 bg-gradient-to-t from-background via-background to-transparent">
        <div className="max-w-md mx-auto flex flex-col gap-2">
          <Button onClick={() => navigate(`/r/${report.id}`)} className="w-full h-12 rounded-full font-semibold">
            Submit Report
          </Button>
          <Button variant="ghost" onClick={() => navigate(-1)} className="w-full h-12 rounded-full">
            Edit Details
          </Button>
        </div>
      </div>
    </div>
  );
}