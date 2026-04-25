import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { isDemoMode } from "@/lib/dataSource";
import { toast } from "sonner";
import { ChevronLeft, Mail, Lock } from "lucide-react";

export default function Auth({ signup = false }: { signup?: boolean }) {
  const navigate = useNavigate();
  const { signInEmail, signUpEmail, signInGoogle, signInAnon } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const handleEmail = async () => {
    if (isDemoMode) return toast("Demo mode — connect Firebase to sign in.");
    setBusy(true);
    try {
      if (signup) await signUpEmail(email, password);
      else await signInEmail(email, password);
      navigate("/home");
    } catch (e) { toast.error((e as Error).message); } finally { setBusy(false); }
  };
  const handleGoogle = async () => {
    if (isDemoMode) return toast("Demo mode — connect Firebase to sign in.");
    try { await signInGoogle(); navigate("/home"); } catch (e) { toast.error((e as Error).message); }
  };
  const handleAnon = async () => {
    if (isDemoMode) { toast("Demo mode — exploring without an account."); return navigate("/home"); }
    try { await signInAnon(); navigate("/home"); } catch (e) { toast.error((e as Error).message); }
  };

  return (
    <div className="min-h-screen px-6 pt-safe pb-safe flex flex-col">
      <button onClick={() => navigate(-1)} className="mt-4 -ml-1 h-9 w-9 rounded-full grid place-items-center hover:bg-muted">
        <ChevronLeft className="h-5 w-5" />
      </button>
      <div className="mt-8">
        <h1 className="text-3xl font-semibold tracking-tight">{signup ? "Create account" : "Welcome back"}</h1>
        <p className="text-sm text-muted-foreground mt-2">{signup ? "Start reporting and tracking road issues." : "Sign in to continue."}</p>
      </div>
      <div className="mt-8 space-y-3">
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full py-4 pl-11 pr-4 rounded-2xl bg-surface-muted border border-transparent focus:border-primary focus:bg-surface outline-none text-[15px]" />
        </div>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full py-4 pl-11 pr-4 rounded-2xl bg-surface-muted border border-transparent focus:border-primary focus:bg-surface outline-none text-[15px]" />
        </div>
        <button onClick={handleEmail} disabled={busy} className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-semibold text-[15px] shadow-soft active:scale-[0.99] transition disabled:opacity-60">
          {signup ? "Create account" : "Sign in"}
        </button>
      </div>
      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" />or<div className="h-px flex-1 bg-border" />
      </div>
      <div className="space-y-2.5">
        <button onClick={handleGoogle} className="w-full py-4 rounded-2xl bg-surface border border-border font-medium text-[15px] hover:bg-muted transition">Continue with Google</button>
        <button onClick={handleAnon} className="w-full py-4 rounded-2xl bg-transparent text-foreground font-medium text-[15px] hover:bg-muted transition">Report without an account</button>
      </div>
      <p className="mt-auto text-center text-sm text-muted-foreground">
        {signup ? (<>Already have an account? <Link className="text-primary font-medium" to="/auth">Sign in</Link></>) : (<>New here? <Link className="text-primary font-medium" to="/auth/signup">Create account</Link></>)}
      </p>
    </div>
  );
}
