import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { PageHeader, SoftCard, EmptyState } from "@/components/ui-kit";
import { listNotifications } from "@/lib/dataSource";

export default function Notifications() {
  const [items, setItems] = useState<Awaited<ReturnType<typeof listNotifications>>>([]);
  useEffect(() => { listNotifications("demo-user").then(setItems); }, []);

  return (
    <div>
      <PageHeader title="Notifications" back />
      <div className="px-5 space-y-2.5">
        {items.length === 0 ? (
          <EmptyState title="You're all caught up" subtitle="Updates on your reports will appear here." />
        ) : items.map((n) => (
          <Link key={n.id} to={`/r/${n.reportId}`}>
            <SoftCard className="p-4 hover:bg-surface-muted/50 transition">
              <div className="flex items-start gap-3">
                <div className={`h-9 w-9 rounded-xl grid place-items-center shrink-0 ${n.unread ? "bg-primary text-primary-foreground" : "bg-surface-muted text-muted-foreground"}`}>
                  <Bell className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm">{n.title}</div>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.body}</p>
                  <div className="text-[11px] text-muted-foreground mt-1.5">{n.at}</div>
                </div>
                {n.unread && <span className="h-2 w-2 rounded-full bg-primary mt-2" />}
              </div>
            </SoftCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
