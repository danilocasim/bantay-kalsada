import { useMemo, useState } from "react";
import { Camera, CreditCard, ShieldCheck } from "lucide-react";
import { SoftCard } from "@/components/ui-kit";
import type { IdentityVerification } from "@/lib/types";

type Step = 1 | 2 | 3;

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Unable to read file."));
    reader.readAsDataURL(file);
  });

export function IdentityVerificationFlow({
  verification,
  onSubmit,
}: {
  verification: IdentityVerification;
  onSubmit: (input: { idImageURL: string; selfieImageURL: string }) => Promise<void>;
}) {
  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  const [idImageURL, setIdImageURL] = useState(verification.idImageURL ?? "");
  const [selfieImageURL, setSelfieImageURL] = useState(verification.selfieImageURL ?? "");

  const statusTone = useMemo(() => {
    if (verification.status === "verified") return "bg-status-resolved/10 text-status-resolved";
    if (verification.status === "pending_review") return "bg-primary-soft text-primary";
    if (verification.status === "rejected") return "bg-status-urgent/10 text-status-urgent";
    return "bg-surface-muted text-muted-foreground";
  }, [verification.status]);

  const handleFile = async (file: File | undefined, setter: (value: string) => void) => {
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    setter(dataUrl);
  };

  const submit = async () => {
    if (!idImageURL || !selfieImageURL) return;
    setSubmitting(true);
    try {
      await onSubmit({ idImageURL, selfieImageURL });
      setStep(3);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SoftCard className="mt-5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">Verification and trust</div>
          <p className="text-xs text-muted-foreground mt-1">Optional for the pilot. This helps reduce duplicate accounts and improve trust in confirmations.</p>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusTone}`}>
          {verification.status.replace("_", " ")}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        {(["Why verify", "Upload", "Review"] as const).map((label, index) => (
          <div key={label} className="rounded-2xl bg-surface-muted px-2 py-3">
            <div className={`mx-auto h-7 w-7 rounded-full grid place-items-center text-xs font-semibold ${index + 1 <= step ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"}`}>
              {index + 1}
            </div>
            <div className="text-[11px] font-medium mt-2 text-foreground/80">{label}</div>
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="mt-4 space-y-3">
          <div className="rounded-2xl bg-primary-soft px-4 py-3 text-sm text-foreground/85">Use verification only if you want stronger trust weighting for reports and confirmations. It is not required to use the app.</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2"><CreditCard className="h-4 w-4 mt-0.5 text-primary" /> We ask for one National ID image and one selfie.</li>
            <li className="flex gap-2"><ShieldCheck className="h-4 w-4 mt-0.5 text-primary" /> Files are reviewed for pilot trust only and should never appear on public case pages.</li>
            <li className="flex gap-2"><Camera className="h-4 w-4 mt-0.5 text-primary" /> Manual review remains possible if the prototype match is unclear.</li>
          </ul>
          <button onClick={() => setStep(2)} className="w-full py-3.5 rounded-2xl bg-foreground text-background font-semibold text-sm">
            Continue
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="mt-4 space-y-4">
          <UploadCard
            title="National ID"
            helper="Upload a clear photo of your National ID. Sensitive data stays outside public reports."
            preview={idImageURL}
            accept="image/*"
            onChange={(file) => handleFile(file, setIdImageURL)}
          />
          <UploadCard
            title="Selfie / face scan"
            helper="Take a front-facing selfie in good lighting so a reviewer can compare it if needed."
            preview={selfieImageURL}
            accept="image/*"
            capture="user"
            onChange={(file) => handleFile(file, setSelfieImageURL)}
          />
          <div className="flex gap-2">
            <button onClick={() => setStep(1)} className="flex-1 py-3.5 rounded-2xl bg-surface border border-border font-medium text-sm">
              Back
            </button>
            <button
              onClick={submit}
              disabled={!idImageURL || !selfieImageURL || submitting}
              className="flex-1 py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-50"
            >
              {submitting ? "Submitting…" : "Submit for review"}
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="mt-4 rounded-2xl bg-primary-soft px-4 py-4">
          <div className="text-sm font-semibold text-foreground">Verification submitted</div>
          <p className="text-sm text-muted-foreground mt-1">Your verification is now pending review. You can keep using the app while this is checked.</p>
        </div>
      )}
    </SoftCard>
  );
}

function UploadCard({
  title,
  helper,
  preview,
  accept,
  capture,
  onChange,
}: {
  title: string;
  helper: string;
  preview: string;
  accept: string;
  capture?: "user" | "environment";
  onChange: (file: File | undefined) => void;
}) {
  return (
    <label className="block rounded-2xl border border-border bg-surface-muted overflow-hidden cursor-pointer">
      {preview ? (
        <img src={preview} alt={title} className="w-full h-40 object-cover" />
      ) : (
        <div className="h-40 grid place-items-center text-muted-foreground bg-surface">
          <div className="text-center px-6">
            <div className="text-sm font-semibold text-foreground">Upload {title}</div>
            <p className="text-xs mt-1">Tap to choose or capture an image</p>
          </div>
        </div>
      )}
      <div className="px-4 py-3">
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs text-muted-foreground mt-1">{helper}</div>
      </div>
      <input type="file" accept={accept} capture={capture} onChange={(event) => onChange(event.target.files?.[0])} className="hidden" />
    </label>
  );
}
