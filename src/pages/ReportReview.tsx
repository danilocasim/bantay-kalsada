import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Check, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { AiAssistCard } from "@/components/AiAssistCard";
import { SoftCard, StatusBadge } from "@/components/ui-kit";
import { subscribeReport } from "@/lib/dataSource";
import { CATEGORY_LABEL, type Report } from "@/lib/types";

export default function ReportReview() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [report, setReport] = useState<Report | null>(null);

  useEffect(() => {
    if (!id) return;
    return subscribeReport(id, setReport);
  }, [id]);

  return (
    <div className="min-h-screen px-5 pt-safe pb-safe flex flex-col">
      <div className="pt-8 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 220, damping: 16 }}
          className="mx-auto h-16 w-16 rounded-full bg-status-resolved text-white grid place-items-center shadow-float">
          <Check className="h-8 w-8" strokeWidth={3} />
        </motion.div>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight">Report submitted</h1>
        <p className="text-sm text-muted-foreground mt-1.5">You can now track what happens next and share the public case page if needed.</p>
      </div>
      {report && (
        <>
          <SoftCard className="mt-7">
            <div className="text-xs font-semibold uppercase tracking-wide text-primary">Tracking summary</div>
            <div className="mt-2 text-base font-semibold tracking-tight">{report.title}</div>
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{report.address ?? "Pinned location"}</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="text-muted-foreground">Category</div>
                <div className="font-medium mt-0.5">{CATEGORY_LABEL[report.aiCategory ?? report.category]}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Current status</div>
                <div className="mt-1"><StatusBadge status={report.status} /></div>
              </div>
              <div className="col-span-2">
                <div className="text-muted-foreground">What happens next</div>
                <div className="font-medium mt-0.5">{report.agencyName ? `Likely routing: ${report.agencyName}` : "The report will be reviewed and routed to the likely office."}</div>
              </div>
            </div>
          </SoftCard>

          <AiAssistCard report={report} />
        </>
      )}
      <div className="mt-auto space-y-2.5 pt-6">
        <button onClick={() => navigate(`/r/${id}`)} className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-semibold text-[15px] shadow-soft">Track this case</button>
        <button onClick={() => navigate("/track")} className="w-full py-4 rounded-2xl bg-surface border border-border text-foreground font-medium text-[15px] hover:bg-muted">View my reports</button>
        <button onClick={() => navigate("/home")} className="w-full py-4 rounded-2xl bg-transparent text-foreground font-medium text-[15px] hover:bg-muted">Back to home</button>
      </div>
    </div>
  );
}
