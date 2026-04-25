import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, ChevronRight, Info, LayoutList, Shield, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { HowPriorityWorksContent } from "@/components/HowPriorityWorksContent";
import { IdentityVerificationFlow } from "@/components/IdentityVerificationFlow";
import { PageHeader, SoftCard } from "@/components/ui-kit";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { accountPrimarySubtitle, accountReferenceId, accountTitle, avatarInitial } from "@/lib/accountDisplay";
import { DEMO_USER_ID, getIdentityVerification, listMyReports, submitIdentityVerification } from "@/lib/dataSource";
import { useSession } from "@/lib/session";
import type { IdentityVerification, Report } from "@/lib/types";

export default function Profile() {
  const navigate = useNavigate();
  const session = useSession();
  const [aboutOpen, setAboutOpen] = useState(false);
  const [priorityOpen, setPriorityOpen] = useState(false);
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
  const displayTitle = accountTitle(session.displayName, session.email, session.isDemo);
  const supportRef = accountReferenceId(session.userId, session.isDemo);

  const handleVerificationSubmit = async (input: { idImageURL: string; selfieImageURL: string }) => {
    const next = await submitIdentityVerification(session.userId ?? DEMO_USER_ID, input);
    setVerification(next);
    toast.success("Verification submitted for review.");
  };

  return (
    <div>
      <PageHeader title="Profile" subtitle="Trust, notifications, and your reporting history." />
      <div className="px-5 pb-8">
        <SoftCard className="shadow-sm">
          <div className="flex items-start gap-4">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-primary text-xl font-semibold text-primary-foreground">
              {avatarInitial(displayTitle)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-base font-semibold text-foreground">{displayTitle}</div>
              <p className="mt-1 text-xs leading-snug text-muted-foreground">{accountPrimarySubtitle(session)}</p>
              {supportRef ? (
                <p className="mt-2 rounded-lg bg-muted/50 px-2.5 py-1.5 font-mono text-[11px] leading-tight text-muted-foreground">{supportRef}</p>
              ) : null}
            </div>
          </div>
        </SoftCard>

        <Link to="/track" className="mt-4 block rounded-2xl outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
          <SoftCard className="border-border/90 p-4 shadow-sm transition hover:border-primary/25 hover:bg-primary-soft/30">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                  <LayoutList className="h-5 w-5" strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-foreground">My reports</div>
                  <div className="text-xs text-muted-foreground">Open Track for timelines and status</div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border/70 pt-4 text-center">
              <DashboardStat label="Filed" value={reports.length} />
              <DashboardStat label="Resolved" value={resolved} />
              <DashboardStat label="Confirms" value={confirms} />
            </div>
          </SoftCard>
        </Link>

        <SoftCard className="mt-5 border-primary/15 bg-primary-soft/50 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <ShieldCheck className="h-5 w-5" strokeWidth={2} />
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">Trust and verification</div>
              <p className="mt-1 text-xs leading-snug text-muted-foreground">
                Optional for the pilot. Helps limit duplicate accounts and strengthen confirmations.
              </p>
            </div>
          </div>
        </SoftCard>

        <IdentityVerificationFlow verification={verification} onSubmit={handleVerificationSubmit} />

        <div className="mt-6 flex flex-col gap-3">
          <Row icon={Bell} label="Notifications" onClick={() => navigate("/notifications")} />
          <Row icon={Shield} label="How priority works" onClick={() => setPriorityOpen(true)} />
          <Row icon={Info} label="About Bantay Kalsada" onClick={() => setAboutOpen(true)} />
        </div>
      </div>

      <Drawer open={priorityOpen} onOpenChange={setPriorityOpen}>
        <DrawerContent className="mx-auto max-h-[92vh] w-full max-w-lg rounded-t-[20px] border border-border/60 bg-background shadow-[0_-12px_48px_rgba(0,0,0,0.12)]">
          <DrawerHeader className="border-b border-border/60 pb-3 text-left">
            <DrawerTitle className="text-[20px] font-semibold tracking-tight">How priority works</DrawerTitle>
            <DrawerDescription className="sr-only">Severity levels and how they differ from case status</DrawerDescription>
          </DrawerHeader>
          <div className="max-h-[min(72vh,560px)] overflow-y-auto overscroll-contain">
            <HowPriorityWorksContent />
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer open={aboutOpen} onOpenChange={setAboutOpen}>
        <DrawerContent className="mx-auto max-h-[92vh] w-full max-w-lg rounded-t-[20px] border border-border/60 bg-background shadow-[0_-12px_48px_rgba(0,0,0,0.12)]">
          <DrawerHeader className="border-b border-border/60 pb-3 text-left">
            <DrawerTitle className="text-[20px] font-semibold tracking-tight">About Bantay Kalsada</DrawerTitle>
            <DrawerDescription className="sr-only">What this app is for and how it works</DrawerDescription>
          </DrawerHeader>
          <div className="max-h-[min(72vh,560px)] space-y-5 overflow-y-auto overscroll-contain px-5 pb-10 pt-4 text-[15px] leading-relaxed text-foreground">
            <p className="text-muted-foreground">
              Bantay Kalsada helps residents report road hazards with a photo and map pin, then follow the public status of each case—from review and routing through resolution.
            </p>
            <section>
              <h3 className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">For the community</h3>
              <ul className="mt-2 list-disc space-y-2 pl-5 text-muted-foreground">
                <li>File a report in a few steps: image, location, short description.</li>
                <li>Track updates on cases you care about, including agency progress when published.</li>
                <li>Confirm unresolved issues when you see the same problem, or reopen a case if it was closed too soon.</li>
              </ul>
            </section>
            <section>
              <h3 className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">Transparency</h3>
              <p className="mt-2 text-muted-foreground">
                Report pages are built for public visibility where appropriate: category, severity, timeline, and (when provided) resolution proof. Pilot features like optional identity verification are designed to improve trust without exposing private documents on public pages.
              </p>
            </section>
            <section>
              <h3 className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">Data &amp; pilot</h3>
              <p className="mt-2 text-muted-foreground">
                In production, accounts and live data are backed by Firebase. Without full backend configuration, the app may run with demo data so flows can still be tested. Nothing in this sheet replaces official government channels—use 8888 or local offices where required.
              </p>
            </section>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

function DashboardStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-muted/40 py-2.5">
      <div className="text-lg font-semibold tracking-tight text-foreground">{value}</div>
      <div className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
    </div>
  );
}

function Row({ icon: Icon, label, onClick }: { icon: typeof Bell; label: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl border border-border/80 bg-surface px-4 py-3.5 text-left shadow-sm transition hover:border-border hover:bg-muted/30 active:bg-muted/40"
    >
      <Icon className="h-5 w-5 shrink-0 text-muted-foreground" strokeWidth={1.75} />
      <span className="flex-1 text-sm font-medium text-foreground">{label}</span>
      <span className="text-muted-foreground" aria-hidden>
        ›
      </span>
    </button>
  );
}
