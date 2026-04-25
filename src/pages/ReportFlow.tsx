import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageHeader, SoftCard } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Camera, Image as ImageIcon, MapPin, Loader2 } from "lucide-react";
import { CATEGORY_LABEL, type Category } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { getBucket, getDb } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { geohashForLocation } from "geofire-common";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const CATEGORIES: Category[] = ["pothole", "flood", "drainage", "manhole", "sign", "obstruction", "other"];

export default function ReportFlow() {
  const [params] = useSearchParams();
  const initialCat = (params.get("cat") as Category) ?? "pothole";
  const navigate = useNavigate();
  const { user } = useAuth();

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [category, setCategory] = useState<Category>(initialCat);
  const [description, setDescription] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (p) => setCoords({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => setCoords({ lat: 14.5995, lng: 120.9842 }),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, []);

  function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const list = Array.from(e.target.files ?? []).slice(0, 4);
    setFiles(list);
    setPreviews(list.map((f) => URL.createObjectURL(f)));
  }

  async function submit() {
    if (!user) return;
    if (files.length === 0) {
      toast({ title: "Add evidence", description: "Please add at least one photo.", variant: "destructive" });
      return;
    }
    if (!coords) {
      toast({ title: "Location needed", description: "Please allow location access.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const db = getDb();
      const docRef = await addDoc(collection(db, "reports"), {
        title: CATEGORY_LABEL[category],
        description,
        category,
        severity: "moderate",
        status: "submitted",
        geo: coords,
        geohash: geohashForLocation([coords.lat, coords.lng]),
        reporterUid: user.uid,
        anonymous: false,
        photoURLs: [],
        confirmCount: 0,
        urgencyScore: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const bucket = getBucket();
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const r = storageRef(bucket, `reports/${docRef.id}/${i}-${Date.now()}-${f.name}`);
        await uploadBytes(r, f, { contentType: f.type });
        urls.push(await getDownloadURL(r));
      }
      // Update report with photo URLs (simple inline update)
      await import("firebase/firestore").then(({ updateDoc, doc }) =>
        updateDoc(doc(db, "reports", docRef.id), { photoURLs: urls }),
      );

      navigate(`/analyze/${docRef.id}`);
    } catch (err) {
      toast({ title: "Submission failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="pb-32">
      <PageHeader title="Report a Road Issue" back />
      <div className="px-5 space-y-4">
        <SoftCard>
          <h2 className="text-base font-semibold">Add Evidence</h2>
          <p className="text-sm text-muted-foreground mt-1">A clear photo helps the AI classify and route correctly.</p>
          <div className="mt-4 grid grid-cols-3 gap-2.5">
            <button onClick={() => cameraInput.current?.click()} className="aspect-square rounded-2xl bg-primary-soft text-primary flex flex-col items-center justify-center gap-1.5 active:scale-95 transition">
              <Camera className="h-6 w-6" />
              <span className="text-xs font-medium">Take Photo</span>
            </button>
            <button onClick={() => fileInput.current?.click()} className="aspect-square rounded-2xl bg-surface-muted text-foreground flex flex-col items-center justify-center gap-1.5 active:scale-95 transition border border-border/60">
              <ImageIcon className="h-6 w-6" />
              <span className="text-xs font-medium">Upload</span>
            </button>
            <div className="aspect-square rounded-2xl bg-surface-muted text-muted-foreground flex items-center justify-center text-xs border border-border/60">
              {previews.length > 0 ? `${previews.length} selected` : "Video soon"}
            </div>
          </div>
          {previews.length > 0 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {previews.map((p, i) => (
                <img key={i} src={p} alt={`evidence ${i + 1}`} className="h-20 w-20 rounded-xl object-cover" />
              ))}
            </div>
          )}
          <input ref={cameraInput} type="file" accept="image/*" capture="environment" hidden onChange={onFiles} />
          <input ref={fileInput} type="file" accept="image/*" multiple hidden onChange={onFiles} />
        </SoftCard>

        <SoftCard>
          <h2 className="text-base font-semibold">What happened?</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-sm font-medium border transition",
                  category === c
                    ? "bg-foreground text-background border-foreground"
                    : "bg-surface text-foreground border-border hover:bg-muted",
                )}
              >
                {CATEGORY_LABEL[c]}
              </button>
            ))}
          </div>
        </SoftCard>

        <SoftCard>
          <h2 className="text-base font-semibold">Location</h2>
          <div className="mt-3 rounded-xl bg-surface-muted h-36 grid place-items-center">
            <div className="text-center">
              <MapPin className="h-6 w-6 text-primary mx-auto" />
              <p className="text-xs mt-2 text-muted-foreground">
                {coords ? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}` : "Detecting GPS…"}
              </p>
            </div>
          </div>
        </SoftCard>

        <SoftCard>
          <h2 className="text-base font-semibold">Add details</h2>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Example: Large pothole near the pedestrian lane, dangerous for motorcycles."
            className="mt-3 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </SoftCard>
      </div>

      <div className="fixed bottom-0 inset-x-0 px-5 pb-safe pt-3 bg-gradient-to-t from-background via-background to-transparent">
        <div className="max-w-md mx-auto">
          <Button onClick={submit} disabled={submitting} className="w-full h-12 rounded-full text-base font-semibold">
            {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Submit Report"}
          </Button>
        </div>
      </div>
    </div>
  );
}