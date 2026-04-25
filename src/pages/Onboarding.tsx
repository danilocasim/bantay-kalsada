import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, ShieldCheck, Sparkles } from "lucide-react";

export default function Onboarding() {
  const navigate = useNavigate();
  const finish = () => {
    localStorage.setItem("bk_onboarded", "1");
    navigate("/auth");
  };
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 px-6 pt-16 pb-6 flex flex-col">
        <div className="mx-auto mb-10 relative">
          <div className="h-44 w-44 rounded-[2.5rem] bg-primary-soft grid place-items-center">
            <MapPin className="h-20 w-20 text-primary" strokeWidth={1.5} />
          </div>
          <div className="absolute -bottom-3 -right-3 h-14 w-14 rounded-2xl bg-status-resolved/15 grid place-items-center">
            <ShieldCheck className="h-7 w-7 text-status-resolved" />
          </div>
          <div className="absolute -top-3 -left-3 h-12 w-12 rounded-2xl bg-status-pothole/15 grid place-items-center">
            <Sparkles className="h-6 w-6 text-status-pothole" />
          </div>
        </div>

        <h1 className="text-[34px] leading-[1.1] font-semibold tracking-tight text-center text-foreground">
          Report road problems.
          <br />
          Help your community move safer.
        </h1>
        <p className="mt-4 text-center text-muted-foreground text-base max-w-sm mx-auto">
          Submit road hazards with photo and GPS. AI helps route them to the right
          government office and track progress publicly.
        </p>

        <div className="mt-auto pt-10 flex flex-col items-center gap-4 pb-safe">
          <Button
            size="lg"
            className="w-full max-w-sm rounded-full h-12 text-base font-semibold"
            onClick={finish}
          >
            Get Started
          </Button>
          <button
            onClick={() => navigate("/map")}
            className="text-primary text-sm font-medium"
          >
            View Public Map
          </button>
        </div>
      </div>
    </div>
  );
}