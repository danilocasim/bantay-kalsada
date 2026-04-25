import { useEffect, useState } from "react";
import { Download } from "lucide-react";

const DISMISS_KEY = "bk_install_prompt_dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

export function InstallPrompt() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setDismissed(window.localStorage.getItem(DISMISS_KEY) === "1");

    const handleBeforeInstall = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  if (!promptEvent || dismissed || isStandalone()) return null;

  const dismiss = () => {
    setDismissed(true);
    window.localStorage.setItem(DISMISS_KEY, "1");
  };

  const install = async () => {
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    if (choice.outcome !== "accepted") {
      dismiss();
      return;
    }
    setPromptEvent(null);
  };

  return (
    <div className="mt-4 rounded-3xl bg-primary-soft border border-primary/10 px-4 py-4 flex items-start gap-3">
      <div className="h-10 w-10 rounded-2xl bg-primary text-primary-foreground grid place-items-center shrink-0">
        <Download className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-foreground">Install Bantay Kalsada</div>
        <p className="text-xs text-muted-foreground mt-1">Add it to your home screen for faster reporting and easier tracking.</p>
        <div className="mt-3 flex items-center gap-2">
          <button onClick={install} className="px-3.5 py-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
            Add to Home Screen
          </button>
          <button onClick={dismiss} className="px-3.5 py-2 rounded-full bg-surface text-muted-foreground text-xs font-medium border border-border">
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
