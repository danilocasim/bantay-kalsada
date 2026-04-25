import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { LoadRetry } from "@/components/LoadRetry";
import { PageHeader, SoftCard, EmptyState } from "@/components/ui-kit";
import { track } from "@/lib/analytics";
import { DEMO_USER_ID, listNotifications } from "@/lib/dataSource";
import { useSession } from "@/lib/session";

export default function Notifications() {
  const session = useSession();
  const [items, setItems] = useState<Awaited<ReturnType<typeof listNotifications>>>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!session.isReady) return;
    setError(null);
    try {
      const next = await listNotifications(session.userId ?? DEMO_USER_ID);
      setItems(next);
      track("notifications_load", { ok: true });
    } catch {
      setError("Could not load notifications.");
      track("notifications_load", { ok: false });
    }
  }, [session.isReady, session.userId]);

  useEffect(() => {
    void load();
    track("screen_view", { name: "notifications" });
  }, [load]);

  return (
    <div>
      <PageHeader title="Notifications" back />
      <div className="flex flex-col gap-5 px-5">
        {error ? <LoadRetry message={error} onRetry={() => void load()} /> : null}
        {!error && items.length === 0 ? (
          <EmptyState title="You&apos;re all caught up" subtitle="Updates about your reports and community confirmations will appear here." />
        ) : null}
        {!error && items.length > 0
          ? items.map((n) => (
              <Link key={n.id} to={`/r/${n.reportId}`}>
                <SoftCard className="p-4 transition hover:bg-surface-muted/50">
                  <div className="flex items-start gap-3">
                    <div
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${n.unread ? "bg-primary text-primary-foreground" : "bg-surface-muted text-muted-foreground"}`}
                    >
                      <Bell className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium">{n.title}</div>
                      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{n.body}</p>
                      <div className="mt-1.5 text-[11px] text-muted-foreground">{n.at}</div>
                    </div>
                    {n.unread ? <span className="mt-2 h-2 w-2 rounded-full bg-primary" /> : null}
                  </div>
                </SoftCard>
              </Link>
            ))
          : null}
      </div>
    </div>
  );
}
