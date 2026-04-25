import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { SoftCard, SeverityBadge } from "@/components/ui-kit";
import { getReport } from "@/lib/dataSource";
import { CATEGORY_LABEL, type Report } from "@/lib/types";

export default function ReportReview() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [report, setReport] = useState<Report | null>(null);
  useEffect(() => { if (id) getReport(id).then(setReport); }, [id]);

  return (
    <div className="min-h-screen px-5 pt-safe pb-safe flex flex-col">
      <div className="pt-8 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 220, damping: 16 }}
          className="mx-auto h-16 w-16 rounded-full bg-status-resolved text-white grid place-items-center shadow-float">
          <Check className="h-8 w-8" strokeWidth={3} />
        </motion.div>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight">Report submitted</h1>
        <p className="text-sm text-muted-foreground mt-1.5">Thanks for keeping the roads safer.</p>
      </div>
      {report && (
        <SoftCard className="mt-7">
          <div className="text-xs font-semibold uppercase tracking-wide text-primary">AI Summary</div>
          <p className="text-sm text-foreground/90 mt-1.5 leading-relaxed">{report.aiSummary}</p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
            <div><div className="text-muted-foreground">Category</div><div className="font-medium mt-0.5">{CATEGORY_LABEL[report.aiCategory ?? report.category]}</div></div>
            <div><div className="text-muted-foreground">Severity</div><div className="mt-1"><SeverityBadge severity={report.aiSeverity ?? report.severity} /></div></div>
            <div className="col-span-2"><div className="text-muted-foreground">Routed to</div><div className="font-medium mt-0.5">{report.agencyName ?? "Pending assignment"}</div></div>
          </div>
        </SoftCard>
      )}
      <div className="mt-auto space-y-2.5 pt-6">
        <button onClick={() => navigate(`/r/${id}`)} className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-semibold text-[15px] shadow-soft">View report</button>
        <button onClick={() => navigate("/home")} className="w-full py-4 rounded-2xl bg-transparent text-foreground font-medium text-[15px] hover:bg-muted">Back to home</button>
      </div>
    </div>
  );
}
