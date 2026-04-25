import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, FileSearch } from "lucide-react";
import { subscribeReport } from "@/lib/dataSource";
import type { Report } from "@/lib/types";

const STEPS = ["Reviewing the photo…", "Checking the likely category…", "Preparing the public tracking page…", "Estimating the likely office…"];

export default function AIAnalysis() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [step, setStep] = useState(0);
  const [report, setReport] = useState<Report | null>(null);

  useEffect(() => {
    if (!id) return;
    return subscribeReport(id, setReport);
  }, [id]);

  useEffect(() => {
    if (report && (report.aiSummary || report.aiCategory || report.status !== "submitted")) {
      const t = setTimeout(() => navigate(`/review/${id}`), 600);
      return () => clearTimeout(t);
    }
    if (step >= STEPS.length) {
      const t = setTimeout(() => navigate(`/review/${id}`), 600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStep(step + 1), 900);
    return () => clearTimeout(t);
  }, [step, id, navigate, report]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 pb-safe pt-safe">
      <motion.div
        animate={{ opacity: [0.88, 1, 0.88] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        className="flex h-[72px] w-[72px] items-center justify-center rounded-2xl border border-border bg-muted/40 text-muted-foreground"
      >
        <FileSearch className="h-8 w-8" strokeWidth={1.75} />
      </motion.div>
      <h1 className="mt-8 text-center text-2xl font-semibold tracking-tight text-foreground">Preparing your report</h1>
      <p className="mt-2 max-w-xs text-center text-sm text-muted-foreground">
        We&apos;re finishing the details so you can track this case right away.
      </p>
      <p className="mt-4 max-w-xs rounded-xl border border-border bg-muted/25 px-4 py-3 text-center text-xs leading-snug text-muted-foreground">
        Category and office routing are filled in automatically and can still change after staff review.
      </p>
      <div className="mt-10 w-full max-w-xs space-y-3">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-3 text-sm">
            <div
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold transition ${
                i < step ? "bg-muted text-foreground" : i === step ? "border border-border bg-background text-foreground" : "bg-muted/60 text-muted-foreground"
              }`}
            >
              {i < step ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : <span>{i + 1}</span>}
            </div>
            <span className={i <= step ? "text-foreground" : "text-muted-foreground"}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
