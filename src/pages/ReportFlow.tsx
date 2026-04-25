import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, ChevronDown, ChevronLeft, Info, MapPin, X } from "lucide-react";
import { toast } from "sonner";
import { MapPicker } from "@/components/MapPicker";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { createReport } from "@/lib/dataSource";
import { useSession } from "@/lib/session";
import { CATEGORY_LABEL, PRIMARY_CATEGORY_OPTIONS, SECONDARY_CATEGORY_OPTIONS, type Category } from "@/lib/types";
import { useReportDraft } from "@/hooks/useReportDraft";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type Step = 1 | 2 | 3;

const FALLBACK_CENTER = { lat: 14.6, lng: 121.03 };

export default function ReportFlow() {
  const navigate = useNavigate();
  const session = useSession();
  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  const [showMoreCategories, setShowMoreCategories] = useState(false);
  const { draft, updateDraft, clearDraft } = useReportDraft();
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handlePhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => updateDraft({ photo: String(reader.result) });
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported on this device.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateDraft({ coords: { lat: position.coords.latitude, lng: position.coords.longitude } });
        toast.success("Location captured. You can still adjust the pin manually.");
      },
      () => {
        toast("Could not detect your exact location. Place the pin manually on the map.");
      },
    );
  };

  const submit = async () => {
    if (!session.isReady) {
      toast("Preparing your account. Try again in a moment.");
      return;
    }
    if (!draft.photo || !draft.coords) return;

    setSubmitting(true);
    try {
      const report = await createReport({
        photoURL: draft.photo,
        coords: draft.coords,
        category: draft.category,
        description: draft.description,
      });

      clearDraft();
      toast.success("Report submitted. You can track it right away.");
      track("report_submit", { category: draft.category });
      navigate(`/analyze/${report.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to submit report right now.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background pt-safe pb-safe">
      <header className="flex shrink-0 items-center justify-between border-b border-border/70 bg-background/95 px-5 pb-3 pt-4 backdrop-blur-md">
        <button
          type="button"
          onClick={() => (step > 1 ? setStep((current) => (current - 1) as Step) : navigate(-1))}
          className="h-10 w-10 -ml-1 rounded-full grid place-items-center hover:bg-muted transition"
          aria-label="Back"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex gap-1.5">
          {[1, 2, 3].map((value) => (
            <span key={value} className={`h-1.5 rounded-full transition-all ${value === step ? "w-8 bg-primary" : value < step ? "w-6 bg-primary/60" : "w-6 bg-border"}`} />
          ))}
        </div>
        <button type="button" onClick={() => navigate(-1)} className="h-10 w-10 -mr-1 rounded-full grid place-items-center hover:bg-muted transition" aria-label="Close">
          <X className="h-5 w-5" />
        </button>
      </header>

      <div className="mt-6 min-h-0 flex-1 overflow-y-auto px-5 pb-44">
        {step === 1 && (
          <div>
            <h1 className="text-[28px] font-semibold tracking-tight">Add a clear photo</h1>
            <p className="text-sm text-muted-foreground mt-1.5">A good photo helps reviewers and nearby residents verify the issue faster.</p>

            <input
              ref={photoInputRef}
              id="report-flow-photo"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhoto}
              className="sr-only"
              aria-label="Choose or capture report photo"
            />

            {draft.photo ? (
              <div className="mt-6 space-y-2">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted/60 active:bg-muted"
                  >
                    Change
                  </button>
                </div>
                <div className="min-h-0 overflow-hidden rounded-2xl border border-border bg-muted/20">
                  <img src={draft.photo} alt="Selected report photo" className="w-full object-contain object-top" />
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="mt-6 flex aspect-[4/3] w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/30 px-6 text-center transition hover:border-muted-foreground/40 hover:bg-muted/40"
              >
                <Camera className="h-10 w-10 text-muted-foreground" strokeWidth={1.5} />
                <p className="mt-3 text-sm font-medium text-foreground">Take or choose a photo</p>
                <p className="mt-1 max-w-[260px] text-xs text-muted-foreground">Show the road issue clearly. Tap to open the camera or library.</p>
              </button>
            )}
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="text-[28px] font-semibold tracking-tight">Pin the location</h1>
            <p className="text-sm text-muted-foreground mt-1.5">Use your current location or tap the map to place the pin manually.</p>

            <div className="mt-5 flex gap-2">
              <button type="button" onClick={detectLocation} className="flex-1 p-4 rounded-2xl bg-surface border border-border text-left hover:bg-muted transition">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-primary-soft text-primary grid place-items-center shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Use my location</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Capture first, then adjust if needed</div>
                  </div>
                </div>
              </button>
            </div>

            <div className="mt-4">
              <MapPicker value={draft.coords} onChange={(coords) => updateDraft({ coords })} center={draft.coords ?? FALLBACK_CENTER} />
            </div>

            <div className="mt-3 flex items-center gap-2">
              <p className="min-w-0 flex-1 text-xs text-muted-foreground">
                {draft.coords
                  ? `Pin: ${draft.coords.lat.toFixed(5)}, ${draft.coords.lng.toFixed(5)}`
                  : "Place a pin to continue."}
              </p>
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="shrink-0 rounded-full border border-border bg-background p-1.5 text-muted-foreground transition hover:bg-muted"
                    aria-label="How to set the location"
                  >
                    <Info className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" align="end" className="max-w-[min(280px,calc(100vw-2rem))] text-left text-xs leading-snug">
                  Use <span className="font-medium text-foreground">Use my location</span> or tap anywhere on the map to drop or move the pin. Adjust until it matches where the issue is.
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h1 className="text-[28px] font-semibold tracking-tight">Describe the issue</h1>
            <p className="text-sm text-muted-foreground mt-1.5">Keep it short and useful: what happened, how dangerous it feels, and any nearby landmark.</p>

            <div className="mt-5">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Main category</label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {PRIMARY_CATEGORY_OPTIONS.map((item) => (
                  <CategoryButton key={item} category={item} selected={draft.category === item} onSelect={(category) => updateDraft({ category })} />
                ))}
              </div>
            </div>

            <Collapsible open={showMoreCategories} onOpenChange={setShowMoreCategories} className="mt-4">
              <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-left text-sm font-medium text-foreground transition hover:bg-muted/50">
                <span>More categories</span>
                <ChevronDown
                  className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200", showMoreCategories && "rotate-180")}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="overflow-hidden">
                <div className="grid grid-cols-2 gap-2 pt-3">
                  {SECONDARY_CATEGORY_OPTIONS.map((item) => (
                    <CategoryButton key={item} category={item} selected={draft.category === item} onSelect={(category) => updateDraft({ category })} />
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>

            <div className="mt-5">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Short note</label>
              <textarea
                value={draft.description}
                onChange={(event) => updateDraft({ description: event.target.value })}
                rows={5}
                placeholder="Example: Deep pothole near the pedestrian lane beside the school gate. Motorcycles keep swerving to avoid it."
                className="mt-2 w-full p-4 rounded-2xl bg-surface-muted border border-transparent focus:border-primary focus:bg-surface outline-none text-sm resize-none"
              />
            </div>
          </div>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 pb-safe px-5 pb-4 bg-gradient-to-t from-background via-background to-background/60">
        <div className="mx-auto max-w-md rounded-3xl border border-border bg-surface px-4 py-4 shadow-float">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
            <span>Draft saved automatically</span>
            <span>Step {step} of 3</span>
          </div>
          {step < 3 ? (
            <>
              <button
                type="button"
                onClick={() => setStep((current) => (current + 1) as Step)}
                disabled={(step === 1 && !draft.photo) || (step === 2 && !draft.coords)}
                className="w-full rounded-2xl bg-primary py-4 text-[15px] font-semibold text-primary-foreground shadow-soft disabled:opacity-50"
              >
                Continue
              </button>
              {step === 1 && draft.photo ? (
                <button
                  type="button"
                  onClick={() => updateDraft({ photo: undefined })}
                  className="mt-2 w-full rounded-xl border border-border bg-background py-3 text-sm font-medium text-muted-foreground transition hover:bg-muted/50 hover:text-foreground"
                >
                  Remove
                </button>
              ) : null}
            </>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={!draft.photo || !draft.coords || submitting || !session.isReady}
              className="w-full rounded-2xl bg-primary py-4 text-[15px] font-semibold text-primary-foreground shadow-soft disabled:opacity-50"
            >
              {submitting ? "Submitting…" : !session.isReady ? "Preparing account…" : "Submit report"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function CategoryButton({
  category,
  selected,
  onSelect,
}: {
  category: Category;
  selected: boolean;
  onSelect: (category: Category) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(category)}
      className={`p-3 rounded-2xl text-sm font-medium border transition text-left ${selected ? "bg-primary-soft border-primary text-primary" : "bg-surface border-border text-foreground/80 hover:bg-muted"}`}
    >
      {CATEGORY_LABEL[category]}
    </button>
  );
}
