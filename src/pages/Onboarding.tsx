import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, MapPin, ShieldCheck } from "lucide-react";

const slides = [
  { icon: Camera, title: "Spot it. Snap it.", body: "Capture potholes, floods, broken signs, or any road hazard in seconds." },
  { icon: MapPin, title: "Pin the location", body: "We auto-detect where you are, or drop a pin precisely on the map." },
  { icon: ShieldCheck, title: "Routed to the right agency", body: "AI triages each report and sends it straight to the team that can fix it." },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [i, setI] = useState(0);
  const slide = slides[i];
  const Icon = slide.icon;
  const finish = () => { localStorage.setItem("bk_onboarded", "1"); navigate("/home"); };
  const next = () => (i < slides.length - 1 ? setI(i + 1) : finish());

  return (
    <div className="min-h-screen flex flex-col px-6 pt-safe pb-safe">
      <div className="flex justify-between items-center pt-4">
        <div className="flex gap-1.5">
          {slides.map((_, idx) => (
            <span key={idx} className={`h-1.5 rounded-full transition-all ${idx === i ? "w-6 bg-primary" : "w-1.5 bg-border"}`} />
          ))}
        </div>
        <button onClick={finish} className="text-sm text-muted-foreground">Skip</button>
      </div>
      <div className="flex-1 grid place-items-center">
        <AnimatePresence mode="wait">
          <motion.div key={i} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }} className="text-center max-w-sm">
            <div className="mx-auto mb-8 h-24 w-24 rounded-3xl bg-primary-soft text-primary grid place-items-center">
              <Icon className="h-11 w-11" strokeWidth={1.75} />
            </div>
            <h2 className="text-3xl font-semibold tracking-tight">{slide.title}</h2>
            <p className="text-base text-muted-foreground mt-3 leading-relaxed">{slide.body}</p>
          </motion.div>
        </AnimatePresence>
      </div>
      <button onClick={next} className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-semibold text-[15px] shadow-soft active:scale-[0.99] transition mb-3">
        {i < slides.length - 1 ? "Continue" : "Get Started"}
      </button>
    </div>
  );
}
