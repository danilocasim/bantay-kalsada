import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Check } from "lucide-react";

const STEPS = ["Analyzing photo…", "Classifying severity…", "Routing to nearest agency…", "Generating official report…"];

export default function AIAnalysis() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step >= STEPS.length) { const t = setTimeout(() => navigate(`/review/${id}`), 600); return () => clearTimeout(t); }
    const t = setTimeout(() => setStep(step + 1), 900);
    return () => clearTimeout(t);
  }, [step, id, navigate]);

  return (
    <div className="min-h-screen px-6 pt-safe pb-safe flex flex-col items-center justify-center">
      <motion.div animate={{ scale: [1, 1.08, 1], rotate: [0, 8, -8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="h-24 w-24 rounded-3xl bg-primary text-primary-foreground grid place-items-center shadow-float">
        <Sparkles className="h-11 w-11" strokeWidth={1.75} />
      </motion.div>
      <h1 className="mt-8 text-2xl font-semibold tracking-tight text-center">AI is reviewing your report</h1>
      <p className="text-sm text-muted-foreground mt-2 text-center max-w-xs">Our model is analyzing the photo and matching it to the right agency.</p>
      <div className="mt-10 w-full max-w-xs space-y-3">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-3 text-sm">
            <div className={`h-6 w-6 rounded-full grid place-items-center transition ${i < step ? "bg-status-resolved/15 text-status-resolved" : i === step ? "bg-primary-soft text-primary" : "bg-surface-muted text-muted-foreground"}`}>
              {i < step ? <Check className="h-3.5 w-3.5" /> : <span className="text-[10px] font-bold">{i + 1}</span>}
            </div>
            <span className={i <= step ? "text-foreground" : "text-muted-foreground"}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
