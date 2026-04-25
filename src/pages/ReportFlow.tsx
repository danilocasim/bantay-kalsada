import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, MapPin, ChevronRight, ChevronLeft, X } from "lucide-react";
import { toast } from "sonner";
import { CATEGORY_LABEL, type Category } from "@/lib/types";
import { isDemoMode } from "@/lib/dataSource";

type Step = 1 | 2 | 3;

export default function ReportFlow() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [photo, setPhoto] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [category, setCategory] = useState<Category>("pothole");
  const [description, setDescription] = useState("");

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };
  const detectLocation = () => {
    if (!navigator.geolocation) return toast.error("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => { setCoords({ lat: 14.6, lng: 121.03 }); toast("Using approximate location"); }
    );
  };
  const submit = () => {
    if (isDemoMode) { toast("Demo mode — connect Firebase to actually submit."); navigate("/analyze/demo-1"); return; }
    navigate("/analyze/new");
  };

  return (
    <div className="min-h-screen flex flex-col px-5 pt-safe pb-safe">
      <header className="flex items-center justify-between pt-4">
        <button onClick={() => (step > 1 ? setStep((step - 1) as Step) : navigate(-1))} className="h-9 w-9 -ml-1 rounded-full grid place-items-center hover:bg-muted">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex gap-1.5">
          {[1, 2, 3].map((s) => (<span key={s} className={`h-1.5 w-6 rounded-full ${s <= step ? "bg-primary" : "bg-border"}`} />))}
        </div>
        <button onClick={() => navigate(-1)} className="h-9 w-9 -mr-1 rounded-full grid place-items-center hover:bg-muted">
          <X className="h-5 w-5" />
        </button>
      </header>

      {step === 1 && (
        <div className="flex-1 flex flex-col mt-6">
          <h2 className="text-2xl font-semibold tracking-tight">Add a photo</h2>
          <p className="text-sm text-muted-foreground mt-1">A clear photo helps the AI classify the issue.</p>
          <label className="mt-6 aspect-[4/3] rounded-2xl border-2 border-dashed border-border bg-surface-muted grid place-items-center cursor-pointer overflow-hidden">
            {photo ? <img src={photo} alt="report" className="w-full h-full object-cover" /> : (
              <div className="text-center">
                <Camera className="h-10 w-10 mx-auto text-muted-foreground" strokeWidth={1.5} />
                <p className="mt-2 text-sm text-muted-foreground">Tap to take a photo</p>
              </div>
            )}
            <input type="file" accept="image/*" capture="environment" onChange={handlePhoto} className="hidden" />
          </label>
          <button onClick={() => setStep(2)} disabled={!photo} className="mt-auto w-full py-4 rounded-2xl bg-primary text-primary-foreground font-semibold text-[15px] shadow-soft disabled:opacity-50">Continue</button>
        </div>
      )}

      {step === 2 && (
        <div className="flex-1 flex flex-col mt-6">
          <h2 className="text-2xl font-semibold tracking-tight">Where is it?</h2>
          <p className="text-sm text-muted-foreground mt-1">We use your location to route the report.</p>
          <button onClick={detectLocation} className="mt-6 w-full p-5 rounded-2xl bg-surface border border-border flex items-center gap-3 hover:bg-muted transition">
            <div className="h-11 w-11 rounded-xl bg-primary-soft text-primary grid place-items-center">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="text-left flex-1">
              <div className="font-medium text-sm">{coords ? "Location captured" : "Use my current location"}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{coords ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : "Tap to detect"}</div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
          <button onClick={() => setStep(3)} disabled={!coords} className="mt-auto w-full py-4 rounded-2xl bg-primary text-primary-foreground font-semibold text-[15px] shadow-soft disabled:opacity-50">Continue</button>
        </div>
      )}

      {step === 3 && (
        <div className="flex-1 flex flex-col mt-6">
          <h2 className="text-2xl font-semibold tracking-tight">Describe the issue</h2>
          <p className="text-sm text-muted-foreground mt-1">A short note helps officials prioritize.</p>
          <div className="mt-5">
            <label className="text-xs font-medium text-muted-foreground">Category</label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(Object.keys(CATEGORY_LABEL) as Category[]).map((c) => (
                <button key={c} onClick={() => setCategory(c)}
                  className={`p-3 rounded-xl text-sm font-medium border transition text-left ${category === c ? "bg-primary-soft border-primary text-primary" : "bg-surface border-border text-foreground/80 hover:bg-muted"}`}>
                  {CATEGORY_LABEL[c]}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-5">
            <label className="text-xs font-medium text-muted-foreground">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="What did you see? How dangerous is it?"
              className="mt-2 w-full p-3 rounded-xl bg-surface-muted border border-transparent focus:border-primary focus:bg-surface outline-none text-sm resize-none" />
          </div>
          <button onClick={submit} className="mt-auto w-full py-4 rounded-2xl bg-primary text-primary-foreground font-semibold text-[15px] shadow-soft">Submit report</button>
        </div>
      )}
    </div>
  );
}
