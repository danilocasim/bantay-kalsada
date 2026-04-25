import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { CATEGORY_LABEL, type Report } from "@/lib/types";
import { PageHeader, SoftCard, EmptyState, StatusBadge } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "active", label: "Active" },
  { key: "resolved", label: "Resolved" },
  { key: "awaiting", label: "Awaiting" },
] as const;

export default function Track() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("active");

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const snap = await getDocs(query(collection(getDb(), "reports"), where("reporterUid", "==", user.uid), orderBy("createdAt", "desc")));
        setReports(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Report, "id">) })));
      } catch {
        /* */
      }
    })();
  }, [user]);

  const filtered = reports.filter((r) => {
    if (tab === "resolved") return r.status === "resolved" || r.status === "community_verified";
    if (tab === "awaiting") return r.status === "submitted" || r.status === "routed";
    return r.status !== "resolved" && r.status !== "community_verified";
  });

  return (
    <div>
      <PageHeader title="My Reports" subtitle="Track your civic contributions" />
      <div className="px-5">
        <SoftCard className="p-4">
          <div className="grid grid-cols-3 text-center">
            <div><div className="text-xl font-semibold">{reports.length}</div><div className="text-xs text-muted-foreground">Submitted</div></div>
            <div><div className="text-xl font-semibold">{reports.filter((r) => r.status === "resolved" || r.status === "community_verified").length}</div><div className="text-xs text-muted-foreground">Resolved</div></div>
            <div><div className="text-xl font-semibold">{reports.reduce((a, r) => a + (r.confirmCount ?? 0), 0)}</div><div className="text-xs text-muted-foreground">Confirmations</div></div>
          </div>
        </SoftCard>

        <div className="mt-4 flex gap-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "flex-1 py-2 rounded-full text-sm font-semibold border transition",
                tab === t.key ? "bg-foreground text-background border-foreground" : "bg-surface text-foreground border-border",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-3">
          {filtered.length === 0 ? (
            <EmptyState
              title="No reports yet"
              subtitle="When you report a road issue, it will appear here."
              action={<Link to="/report"><Button className="rounded-full h-11 px-6 font-semibold">Create First Report</Button></Link>}
            />
          ) : (
            filtered.map((r) => (
              <Link key={r.id} to={`/r/${r.id}`}>
                <SoftCard className="flex gap-3 items-center">
                  <div className="h-14 w-14 rounded-xl bg-surface-muted overflow-hidden shrink-0">
                    {r.photoURLs[0] && <img src={r.photoURLs[0]} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold truncate">{r.title}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{CATEGORY_LABEL[r.category]} · {r.confirmCount} confirmations</p>
                    <div className="mt-1.5"><StatusBadge status={r.status} /></div>
                  </div>
                </SoftCard>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}