import { PageHeader, SoftCard } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronRight, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const initials = (user?.displayName ?? user?.email ?? "Friend")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div>
      <PageHeader title="Profile" />
      <div className="px-5 space-y-4">
        <SoftCard className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-primary text-primary-foreground grid place-items-center font-semibold">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold truncate">{user?.displayName ?? "Civic Reporter"}</h2>
            <p className="text-xs text-muted-foreground truncate">{user?.email ?? "Anonymous"}</p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary-soft text-primary">
              {role === "agency_official" ? "Agency Official" : "Community Reporter"}
            </span>
          </div>
        </SoftCard>

        <SoftCard>
          <h3 className="text-sm font-semibold">My Impact</h3>
          <div className="grid grid-cols-3 mt-3 text-center">
            <Stat n={0} l="Submitted" />
            <Stat n={0} l="Confirmed" />
            <Stat n={0} l="Resolved" />
          </div>
        </SoftCard>

        <Section title="Notifications">
          <Toggle label="Updates on my reports" />
          <Toggle label="Urgent issues near me" />
          <Toggle label="Flood alerts" />
          <Toggle label="Agency responses" />
        </Section>

        <Section title="Privacy">
          <Toggle label="Report anonymously" />
          <Toggle label="Hide my name from public reports" />
        </Section>

        <Section title="Help & Guidelines">
          <Row label="What can I report?" />
          <Row label="How reports are verified" />
          <Row label="Community rules" />
        </Section>

        {role === "agency_official" && (
          <Button variant="outline" className="w-full h-12 rounded-full" onClick={() => navigate("/agency")}>
            Open Agency Dashboard
          </Button>
        )}

        <Button variant="ghost" className="w-full h-12 rounded-full text-destructive" onClick={logout}>
          <LogOut className="h-4 w-4 mr-2" /> Sign out
        </Button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <SoftCard className="p-0 overflow-hidden">
      <h3 className="text-sm font-semibold px-5 pt-4">{title}</h3>
      <div className="mt-2 divide-y divide-border/70">{children}</div>
    </SoftCard>
  );
}
function Toggle({ label }: { label: string }) {
  return (
    <div className="px-5 py-3 flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <Switch />
    </div>
  );
}
function Row({ label }: { label: string }) {
  return (
    <button className="w-full px-5 py-3 flex items-center justify-between text-left">
      <span className="text-sm">{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}
function Stat({ n, l }: { n: number; l: string }) {
  return (
    <div>
      <div className="text-xl font-semibold">{n}</div>
      <div className="text-xs text-muted-foreground">{l}</div>
    </div>
  );
}