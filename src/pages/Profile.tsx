import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Info, Shield, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { IdentityVerificationFlow } from "@/components/IdentityVerificationFlow";
import { PageHeader, SoftCard } from "@/components/ui-kit";
import { DEMO_USER_ID, getIdentityVerification, listMyReports, submitIdentityVerification } from "@/lib/dataSource";
import { useSession } from "@/lib/session";
import type { IdentityVerification, Report } from "@/lib/types";

export default function Profile() {
  const navigate = useNavigate();
  const session = useSession();
  const [reports, setReports] = useState<Report[]>([]);
  const [verification, setVerification] = useState<IdentityVerification>({ status: "unverified" });

  useEffect(() => {
    if (!session.isReady) return;
    const uid = session.userId ?? DEMO_USER_ID;
    listMyReports(uid).then(setReports);
    getIdentityVerification(uid).then(setVerification);
  }, [session.isReady, session.userId]);

  const resolved = reports.filter((report) => ["resolved", "community_verified"].includes(report.status)).length;
  const confirms = reports.reduce((sum, report) => sum + report.confirmCount, 0);

  const handleVerificationSubmit = async (input: { idImageURL: string; selfieImageURL: string }) => {
    const next = await submitIdentityVerification(session.userId ?? DEMO_USER_ID, input);
    setVerification(next);
    toast.success("Verification submitted for review.");
  };

  return (
    <div>
      <PageHeader title="Profile" subtitle="Manage your trust status, notifications, and contribution history." />
      <div className="px-5 pb-8">
        <SoftCard>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground grid place-items-center text-xl font-semibold">D</div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-base truncate">Community Reporter</div>
              <div className="text-xs text-muted-foreground mt-0.5">{session.isDemo ? "Pilot participant · local-first prototype mode" : session.isAnonymous ? "Pilot participant · anonymous account" : "Pilot participant"}</div>
            </div>
            <div className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${verification.status === "verified" ? "bg-status-resolved/10 text-status-resolved" : verification.status === "pending_review" ? "bg-primary-soft text-primary" : verification.status === "rejected" ? "bg-status-urgent/10 text-status-urgent" : "bg-surface-muted text-muted-foreground"}`}>
              {verification.status.replace("_", " ")}
            </div>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            <Stat label="Filed" value={reports.length} />
            <Stat label="Resolved" value={resolved} />
            <Stat label="Confirms" value={confirms} />
          </div>
        </SoftCard>

        <SoftCard className="mt-5 bg-primary-soft">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-2xl bg-primary text-primary-foreground grid place-items-center shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold">Trust and verification</div>
              <p className="text-xs text-muted-foreground mt-1">Verification is optional in the pilot. It helps reduce duplicate accounts and improves trust in reports and confirmations.</p>
            </div>
          </div>
        </SoftCard>

        <IdentityVerificationFlow verification={verification} onSubmit={handleVerificationSubmit} />

        <div className="mt-5 space-y-1">
          <Row icon={Bell} label="Notifications" onClick={() => navigate("/notifications")} />
          <Row icon={Shield} label="How priority works" onClick={() => navigate("/urgency")} />
          <Row icon={Info} label="About Bantay Kalsada" />
        </div>
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
