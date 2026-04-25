import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Splash() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    const seen = localStorage.getItem("bk_onboarded");
    const t = setTimeout(() => {
      if (user) navigate("/home", { replace: true });
      else if (seen) navigate("/auth", { replace: true });
      else navigate("/onboarding", { replace: true });
    }, 700);
    return () => clearTimeout(t);
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen grid place-items-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-16 w-16 rounded-2xl bg-primary text-primary-foreground grid place-items-center text-2xl font-bold shadow-float">
          BK
        </div>
        <p className="text-sm text-muted-foreground">Bantay Kalsada</p>
      </div>
    </div>
  );
}