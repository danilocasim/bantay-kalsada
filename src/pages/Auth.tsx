import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/ui-kit";

export default function Auth({ signup = false }: { signup?: boolean }) {
  const navigate = useNavigate();
  const { signInEmail, signUpEmail, signInGoogle, signInAnon } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">(signup ? "signup" : "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") await signUpEmail(email, password);
      else await signInEmail(email, password);
      navigate("/home", { replace: true });
    } catch (err) {
      toast({ title: "Sign-in failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    try {
      await signInGoogle();
      navigate("/home", { replace: true });
    } catch (err) {
      toast({ title: "Google sign-in failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  }

  async function handleAnon() {
    setBusy(true);
    try {
      await signInAnon();
      navigate("/home", { replace: true });
    } catch (err) {
      toast({ title: "Could not continue", description: (err as Error).message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title={mode === "signup" ? "Create account" : "Welcome back"}
        subtitle={mode === "signup" ? "Join your community in keeping roads safe." : "Sign in to track your reports."}
      />
      <div className="px-5 pb-12 max-w-md mx-auto w-full">
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 rounded-xl" />
          </div>
          <Button type="submit" disabled={busy} className="w-full h-12 rounded-full text-base font-semibold">
            {mode === "signup" ? "Create account" : "Sign in"}
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-border" />
          or
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="space-y-2.5">
          <Button variant="outline" disabled={busy} onClick={handleGoogle} className="w-full h-12 rounded-full font-medium">
            Continue with Google
          </Button>
          <Button variant="ghost" disabled={busy} onClick={handleAnon} className="w-full h-12 rounded-full font-medium text-muted-foreground">
            Continue without an account
          </Button>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "signup" ? "Already have an account?" : "New to Bantay Kalsada?"}{" "}
          <button
            type="button"
            className="text-primary font-medium"
            onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
          >
            {mode === "signup" ? "Sign in" : "Create one"}
          </button>
        </p>
      </div>
    </div>
  );
}