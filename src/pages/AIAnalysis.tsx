import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Check, Loader2 } from "lucide-react";
import { PageHeader, SoftCard } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";

const STEPS = [
  "Detecting issue type",
  "Checking GPS location",
  "Finding duplicate reports nearby",
  "Estimating urgency",
  "Identifying responsible agency",
  "Generating official report",
];

export default function AIAnalysis() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step >= STEPS.length) return;
    const t = setTimeout(() => setStep(step + 1), 600);
    return () => clearTimeout(t);
  }, [step]);

  const done = step >= STEPS.length;

  return (
    <div className="pb-10">
      <PageHeader title="AI is reviewing your report" />
      <div className="px-5 space-y-3">
        {STEPS.map((label, i) => (
          <SoftCard key={label} className="flex items-center gap-3 py-3">
            <div className="h-8 w-8 rounded-full grid place-items-center bg-surface-muted">
              {i < step ? (
                <Check className="h-4 w-4 text-status-resolved" />
              ) : i === step ? (
                <Loader2 className="h-4 w-4 text-primary animate-spin" />
              ) : (
                <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
              )}
            </div>
            <span className={`text-sm ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
          </SoftCard>
        ))}

        {done && (
          <SoftCard className="mt-2">
            <h3 className="text-sm font-semibold">Result Summary</h3>
            <dl className="mt-3 text-sm space-y-2">
              <Row k="Detected Issue" v="Pothole" />
              <Row k="Urgency Level" v="High" />
              <Row k="Location" v="Auto-detected GPS" />
              <Row k="Possible Office" v="City Engineering Office" />
              <Row k="Community Tracking" v="Public report page created" />
            </dl>
            <div className="mt-5 flex flex-col gap-2">
              <Button onClick={() => navigate(`/review/${id}`)} className="w-full h-12 rounded-full font-semibold">
                Review Report
              </Button>
              <Button variant="ghost" onClick={() => navigate(`/r/${id}`)} className="w-full h-12 rounded-full font-medium">
                Submit to Officials
              </Button>
            </div>
          </SoftCard>
        )}
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="font-medium text-foreground text-right">{v}</dd>
    </div>
  );
}