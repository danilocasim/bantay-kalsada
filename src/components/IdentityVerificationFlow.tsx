import { useMemo, useState } from "react";
import { Camera, CheckCircle2, Clock, CreditCard, ShieldAlert, ShieldCheck, XCircle } from "lucide-react";
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

function statusLabel(status: IdentityVerification["status"]): string {
  switch (status) {
    case "unverified":
      return "Not verified";
    case "pending_review":
      return "In review";
    case "verified":
      return "Verified";
    case "rejected":
      return "Not approved";
    default:
      return status;
  }
}

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
    if (verification.status === "verified") return "bg-status-resolved/15 text-status-resolved";
    if (verification.status === "pending_review") return "bg-primary-soft text-primary";
    if (verification.status === "rejected") return "bg-status-urgent/10 text-status-urgent";
    return "bg-muted text-muted-foreground";
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
    <SoftCard className="mt-5 overflow-hidden p-0 shadow-sm">
      <div className="border-b border-border/70 bg-muted/20 px-4 py-3.5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-foreground">Identity verification</div>
            <p className="mt-0.5 text-xs leading-snug text-muted-foreground">Optional. Strengthens trust for your reports and confirmations.</p>
          </div>
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusTone}`}>{statusLabel(verification.status)}</span>
        </div>
      </div>

      <div className="p-4">
        {verification.status === "verified" && (
          <div className="flex gap-3 rounded-2xl border border-status-resolved/25 bg-status-resolved/5 px-4 py-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-status-resolved text-white">
              <CheckCircle2 className="h-5 w-5" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-foreground">You&apos;re verified</div>
              <p className="mt-1 text-sm leading-snug text-muted-foreground">
                Your account is treated as higher-trust for confirmations and duplicate checks. ID images are not shown on public report pages.
              </p>
              <p className="mt-3 text-xs font-medium text-status-resolved">No action needed — keep reporting as usual.</p>
              {verification.reviewedAtLabel ? (
                <p className="mt-2 text-[11px] text-muted-foreground">Approved {verification.reviewedAtLabel}</p>
              ) : null}
            </div>
          </div>
        )}

        {verification.status === "pending_review" && (
          <div className="flex gap-3 rounded-2xl border border-primary/20 bg-primary-soft/40 px-4 py-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Clock className="h-5 w-5" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-foreground">Review in progress</div>
              <p className="mt-1 text-sm leading-snug text-muted-foreground">
                A reviewer is checking your submission. This usually stays internal — you can keep using the app normally.
              </p>
              <p className="mt-3 text-xs text-foreground/80">
                <span className="font-medium text-foreground">Next step:</span> wait for approval or follow-up. If something is wrong, support may contact you using your account reference from Profile.
              </p>
              {verification.submittedAtLabel ? (
                <p className="mt-2 text-[11px] text-muted-foreground">Submitted {verification.submittedAtLabel}</p>
              ) : null}
            </div>
          </div>
        )}

        {verification.status === "rejected" && (
          <div className="space-y-4">
            <div className="flex gap-3 rounded-2xl border border-status-urgent/25 bg-status-urgent/5 px-4 py-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-status-urgent/15 text-status-urgent">
                <XCircle className="h-5 w-5" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-foreground">Verification not approved</div>
                <p className="mt-1 text-sm leading-snug text-muted-foreground">
                  We couldn&apos;t approve this submission. You can still use the app; only the extra trust badge is unavailable until a new submission succeeds.
                </p>
                {verification.reviewReason ? (
                  <div className="mt-3 rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground/90">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Note from review</span>
                    <p className="mt-1 leading-snug">{verification.reviewReason}</p>
                  </div>
                ) : null}
                <p className="mt-3 text-xs text-foreground/80">
                  <span className="font-medium text-foreground">Next step:</span> submit clearer ID and selfie photos, or contact support if you think this is a mistake.
                </p>
                {verification.reviewedAtLabel ? (
                  <p className="mt-2 text-[11px] text-muted-foreground">Reviewed {verification.reviewedAtLabel}</p>
                ) : null}
              </div>
            </div>

            <>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {(["Why verify", "Upload", "Review"] as const).map((label, index) => (
                    <div key={label} className="rounded-xl bg-muted/50 px-2 py-2.5">
                      <div
                        className={`mx-auto grid h-7 w-7 place-items-center rounded-full text-xs font-semibold ${
                          index + 1 <= step ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div className="mt-1.5 text-[11px] font-medium text-foreground/85">{label}</div>
                    </div>
                  ))}
                </div>

                {step === 1 && (
                  <div className="space-y-3">
                    <div className="rounded-2xl bg-muted/40 px-4 py-3 text-sm text-foreground/85">
                      Resubmit only if you&apos;re ready with clearer images. Same privacy rules apply: ID stays off public pages.
                    </div>
                    <button type="button" onClick={() => setStep(2)} className="w-full rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground">
                      Continue to upload
                    </button>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <UploadCard
                      title="National ID"
                      helper="Clear, well-lit photo. Edges readable."
                      preview={idImageURL}
                      accept="image/*"
                      onChange={(file) => handleFile(file, setIdImageURL)}
                    />
                    <UploadCard
                      title="Selfie"
                      helper="Match your ID photo; good lighting."
                      preview={selfieImageURL}
                      accept="image/*"
                      capture="user"
                      onChange={(file) => handleFile(file, setSelfieImageURL)}
                    />
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setStep(1)} className="flex-1 rounded-2xl border border-border bg-surface py-3.5 text-sm font-medium">
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={submit}
                        disabled={!idImageURL || !selfieImageURL || submitting}
                        className="flex-1 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                      >
                        {submitting ? "Submitting…" : "Submit again"}
                      </button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="rounded-2xl bg-primary-soft/60 px-4 py-4">
                    <div className="text-sm font-semibold text-foreground">Resubmission received</div>
                    <p className="mt-1 text-sm text-muted-foreground">Pending review again — we&apos;ll update your status when processing finishes.</p>
                  </div>
                )}
            </>
          </div>
        )}

        {verification.status === "unverified" && (
          <>
            <div className="grid grid-cols-3 gap-2 text-center">
              {(["Why verify", "Upload", "Review"] as const).map((label, index) => (
                <div key={label} className="rounded-xl bg-muted/50 px-2 py-2.5">
                  <div
                    className={`mx-auto grid h-7 w-7 place-items-center rounded-full text-xs font-semibold ${
                      index + 1 <= step ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="mt-1.5 text-[11px] font-medium text-foreground/85">{label}</div>
                </div>
              ))}
            </div>

            {step === 1 && (
              <div className="mt-4 space-y-3">
                <div className="flex gap-2 rounded-2xl border border-border/80 bg-surface px-4 py-3 text-sm text-foreground/85">
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>Not required to file reports. Adds trust if you confirm others&apos; issues often.</span>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> One National ID image and one selfie.
                  </li>
                  <li className="flex gap-2">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> Kept for pilot review only — never on public case pages.
                  </li>
                  <li className="flex gap-2">
                    <Camera className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> Unclear photos may be sent back for resubmission.
                  </li>
                </ul>
                <button type="button" onClick={() => setStep(2)} className="w-full rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground">
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
                  <button type="button" onClick={() => setStep(1)} className="flex-1 rounded-2xl border border-border bg-surface py-3.5 text-sm font-medium">
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={submit}
                    disabled={!idImageURL || !selfieImageURL || submitting}
                    className="flex-1 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                  >
                    {submitting ? "Submitting…" : "Submit for review"}
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="mt-4 rounded-2xl bg-primary-soft/60 px-4 py-4">
                <div className="text-sm font-semibold text-foreground">Verification submitted</div>
                <p className="mt-1 text-sm text-muted-foreground">Your documents are queued for review. You can keep using the app while we process them.</p>
              </div>
            )}
          </>
        )}
      </div>
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
    <label className="block cursor-pointer overflow-hidden rounded-2xl border border-border bg-muted/30">
      {preview ? (
        <img src={preview} alt={title} className="h-40 w-full object-cover" />
      ) : (
        <div className="grid h-40 place-items-center bg-surface text-muted-foreground">
          <div className="px-6 text-center">
            <div className="text-sm font-semibold text-foreground">Upload {title}</div>
            <p className="mt-1 text-xs">Tap to choose or capture an image</p>
          </div>
        </div>
      )}
      <div className="px-4 py-3">
        <div className="text-sm font-semibold">{title}</div>
        <div className="mt-1 text-xs text-muted-foreground">{helper}</div>
      </div>
      <input type="file" accept={accept} capture={capture} onChange={(event) => onChange(event.target.files?.[0])} className="hidden" />
    </label>
  );
}
