import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Splash() {
  const navigate = useNavigate();
  useEffect(() => {
    const seen = localStorage.getItem("bk_onboarded");
    const t = setTimeout(() => navigate(seen ? "/home" : "/onboarding"), 1500);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="min-h-screen grid place-items-center bg-background">
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-4"
      >
        <div className="h-20 w-20 rounded-3xl bg-primary text-primary-foreground grid place-items-center shadow-float text-3xl font-bold tracking-tight">
          BK
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Bantay Kalsada</h1>
          <p className="text-sm text-muted-foreground mt-1">Safer roads, together.</p>
        </div>
      </motion.div>
    </div>
  );
}
