import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export function OfflineBanner() {
  const [online, setOnline] = useState(() => (typeof navigator === "undefined" ? true : navigator.onLine));

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (online) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-50 pt-safe px-4">
      <div className="mx-auto max-w-md rounded-2xl bg-foreground text-background px-4 py-3 shadow-float flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-background/10 grid place-items-center shrink-0">
          <WifiOff className="h-4 w-4" />
        </div>
        <div>
          <div className="text-sm font-semibold">You&apos;re offline</div>
          <div className="text-xs text-background/75">Drafts stay saved. Submit once your connection comes back.</div>
        </div>
      </div>
    </div>
  );
}
