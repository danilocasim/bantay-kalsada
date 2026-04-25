import { Link } from "react-router-dom";
import { Bell, AlertTriangle, Droplets, Construction, TriangleAlert } from "lucide-react";
import { PageHeader, SoftCard } from "@/components/ui-kit";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { collection, getCountFromServer, query, where } from "firebase/firestore";
import { getDb } from "@/lib/firebase";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ active: 0, urgent: 0, resolved: 0, awaiting: 0 });

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const db = getDb();
        const reports = collection(db, "reports");
        const [a, u, r, w] = await Promise.all([
          getCountFromServer(query(reports, where("status", "in", ["submitted", "ai_reviewed", "verified", "routed", "acknowledged", "scheduled", "in_progress"]))),
          getCountFromServer(query(reports, where("severity", "==", "high"))),
          getCountFromServer(query(reports, where("status", "in", ["resolved", "community_verified"]))),
          getCountFromServer(query(reports, where("status", "==", "routed"))),
        ]);
        setStats({ active: a.data().count, urgent: u.data().count, resolved: r.data().count, awaiting: w.data().count });
      } catch {
        /* fine — collection may be empty or offline */
      }
    })();
  }, [user]);

  const name = user?.displayName?.split(" ")[0] ?? "Friend";

  return (
    <div>
      <PageHeader
        title={`${greeting()}, ${name}`}
        subtitle="Near your area"
        right={
          <Link to="/notifications" className="h-10 w-10 rounded-full grid place-items-center hover:bg-muted transition" aria-label="Notifications">
            <Bell className="h-5 w-5" />
          </Link>
        }
      />
      <div className="px-5 space-y-4">
        {/* Overview card */}
        <div className="rounded-3xl bg-primary text-primary-foreground p-5 shadow-float">
          <h2 className="text-base font-semibold/none opacity-90">Road Safety Overview</h2>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <Stat label="Active Reports" value={stats.active} />
            <Stat label="Urgent Issues" value={stats.urgent} />
            <Stat label="Resolved This Month" value={stats.resolved} />
            <Stat label="Awaiting Response" value={stats.awaiting} />
          </div>
        </div>

        <SoftCard>
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-primary-soft text-primary grid place-items-center text-base font-semibold">AI</div>
            <div>
              <h3 className="text-sm font-semibold">AI Insight</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Several flood reports were detected near your route. Check the map before traveling.
              </p>
            </div>
          </div>
        </SoftCard>

        <div>
          <h3 className="text-sm font-semibold text-muted-foreground px-1 mb-3 uppercase tracking-wide">Quick report</h3>
          <div className="grid grid-cols-2 gap-3">
            <Quick to="/report?cat=pothole" icon={Construction} tone="status-pothole" label="Pothole" />
            <Quick to="/report?cat=flood" icon={Droplets} tone="status-flood" label="Flood" />
            <Quick to="/report?cat=drainage" icon={TriangleAlert} tone="status-drainage" label="Drainage" />
            <Quick to="/report?cat=other" icon={AlertTriangle} tone="status-urgent" label="Road Hazard" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="text-3xl font-semibold tracking-tight">{value}</div>
      <div className="text-xs opacity-90 mt-0.5">{label}</div>
    </div>
  );
}

function Quick({
  to,
  icon: Icon,
  tone,
  label,
}: {
  to: string;
  icon: typeof Bell;
  tone: string;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="bg-surface rounded-2xl border border-border/70 shadow-soft p-4 flex flex-col gap-3 hover:shadow-float transition active:scale-[0.98]"
    >
      <span
        className="h-10 w-10 rounded-xl grid place-items-center"
        style={{ backgroundColor: `hsl(var(--${tone}) / 0.12)`, color: `hsl(var(--${tone}))` }}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="text-sm font-semibold">{label}</span>
    </Link>
  );
}