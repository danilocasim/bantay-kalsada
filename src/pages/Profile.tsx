import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Bell, Info, Shield } from "lucide-react";
import { PageHeader, SoftCard } from "@/components/ui-kit";
import { useAuth } from "@/contexts/AuthContext";
import { listMyReports, isDemoMode } from "@/lib/dataSource";
import type { Report } from "@/lib/types";

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  useEffect(() => { listMyReports(user?.uid ?? "demo-user").then(setReports); }, [user]);

  const resolved = reports.filter((r) => ["resolved", "community_verified"].includes(r.status)).length;
  const confirms = reports.reduce((s, r) => s + r.confirmCount, 0);
  const initial = (user?.displayName ?? user?.email ?? "Demo")[0].toUpperCase();

  return (
    <div>
      <PageHeader title="Profile" />
      <div className="px-5">
        <SoftCard>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground grid place-items-center text-xl font-semibold">{initial}</div>
            <div className="min-w-0">
              <div className="font-semibold text-base truncate">{user?.displayName ?? user?.email ?? "Demo Citizen"}</div>
              <div className="text-xs text-muted-foreground">{isDemoMode ? "Demo account" : user?.email}</div>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            <Stat label="Filed" value={reports.length} />
            <Stat label="Resolved" value={resolved} />
            <Stat label="Confirms" value={confirms} />
          </div>
        </SoftCard>
        <div className="mt-5 space-y-1">
          <Row icon={Bell} label="Notifications" onClick={() => navigate("/notifications")} />
          <Row icon={Shield} label="Urgency levels" onClick={() => navigate("/urgency")} />
          <Row icon={Info} label="About Bantay Kalsada" />
        </div>
        <button
          onClick={async () => { if (!isDemoMode) await logout(); navigate("/auth"); }}
          className="mt-6 w-full py-4 rounded-2xl bg-surface border border-border text-status-urgent font-medium text-[15px] flex items-center justify-center gap-2 hover:bg-status-urgent/5 transition">
          <LogOut className="h-4 w-4" />Sign out
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-surface-muted py-3">
      <div className="text-xl font-semibold tracking-tight">{value}</div>
      <div className="text-[11px] text-muted-foreground uppercase tracking-wide mt-0.5">{label}</div>
    </div>
  );
}

function Row({ icon: Icon, label, onClick }: { icon: typeof Bell; label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="w-full px-4 py-3.5 rounded-2xl bg-surface flex items-center gap-3 hover:bg-surface-muted transition">
      <Icon className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
      <span className="text-sm font-medium flex-1 text-left">{label}</span>
      <span className="text-muted-foreground">›</span>
    </button>
  );
}
