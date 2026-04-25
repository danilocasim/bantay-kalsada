import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDownAZ, ArrowUpAZ, CheckCircle2, Inbox, ListChecks, Search } from "lucide-react";
import { LoadRetry } from "@/components/LoadRetry";
import { PageHeader, SoftCard, StatusBadge, SeverityBadge } from "@/components/ui-kit";
import { track } from "@/lib/analytics";
import { DEMO_USER_ID, listMyReports } from "@/lib/dataSource";
import { useSession } from "@/lib/session";
import { CATEGORY_LABEL, PRIMARY_CATEGORY_OPTIONS, SECONDARY_CATEGORY_OPTIONS, type Category, type Report } from "@/lib/types";
import { cn } from "@/lib/utils";

type TabFilter = "all" | "active" | "resolved";
type SortOrder = "newest" | "oldest";

const ALL_CATEGORIES: Category[] = [...PRIMARY_CATEGORY_OPTIONS, ...SECONDARY_CATEGORY_OPTIONS];

function reportSortKey(r: Report): number {
  return r.updatedAtMs ?? r.createdAtMs ?? 0;
}

export default function Track() {
  const session = useSession();
  const [reports, setReports] = useState<Report[]>([]);
  const [tab, setTab] = useState<TabFilter>("all");
  const [category, setCategory] = useState<Category | "all">("all");
  const [sort, setSort] = useState<SortOrder>("newest");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!session.isReady) return;
    setError(null);
    setLoading(true);
    try {
      const items = await listMyReports(session.userId ?? DEMO_USER_ID);
      setReports(items);
      track("track_load", { ok: true, count: items.length });
    } catch {
      setError("Could not load your reports.");
      track("track_load", { ok: false });
    } finally {
      setLoading(false);
    }
  }, [session.isReady, session.userId]);

  useEffect(() => {
    void load();
    track("screen_view", { name: "track" });
  }, [load]);

  const filtered = useMemo(() => {
    let list = reports.filter((r) => {
      if (tab === "active") return !["resolved", "community_verified"].includes(r.status);
      if (tab === "resolved") return ["resolved", "community_verified"].includes(r.status);
      return true;
    });
    if (category !== "all") list = list.filter((r) => r.category === category);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((r) => {
        const t = (r.title ?? "").toLowerCase();
        const b = (r.barangay ?? "").toLowerCase();
        const a = (r.address ?? "").toLowerCase();
        return t.includes(q) || b.includes(q) || a.includes(q);
      });
    }
    list = [...list].sort((a, b) => {
      const da = reportSortKey(a);
      const db = reportSortKey(b);
      return sort === "newest" ? db - da : da - db;
    });
    return list;
  }, [reports, tab, category, query, sort]);

  const hasAnyReports = reports.length > 0;

  return (
    <div>
      <PageHeader title="Track" subtitle="Follow the progress of the reports you submitted." />
      <div className="mb-3 px-5">
        <label className="sr-only" htmlFor="track-search">
          Search by title or barangay
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input
            id="track-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, barangay, or street"
            className="w-full rounded-xl border border-border bg-surface py-2.5 pl-9 pr-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            autoComplete="off"
          />
        </div>
      </div>

      <div className="mb-2 flex flex-wrap gap-2 px-5">
        {(["all", "active", "resolved"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => {
              setTab(f);
              track("track_tab", { tab: f });
            }}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-medium capitalize transition",
              tab === f ? "bg-primary text-primary-foreground" : "bg-surface-muted text-foreground/75 hover:bg-muted",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="mb-3 px-5">
        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Category</label>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setCategory("all")}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition",
              category === "all" ? "bg-foreground text-background" : "bg-surface-muted text-foreground/75",
            )}
          >
            All
          </button>
          {ALL_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition",
                category === c ? "bg-foreground text-background" : "bg-surface-muted text-foreground/75",
              )}
            >
              {CATEGORY_LABEL[c]}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between px-5">
        <span className="text-[11px] font-medium text-muted-foreground">Sort by update</span>
        <button
          type="button"
          onClick={() => setSort((s) => (s === "newest" ? "oldest" : "newest"))}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground"
          aria-label={sort === "newest" ? "Sort oldest first" : "Sort newest first"}
        >
          {sort === "newest" ? <ArrowDownAZ className="h-3.5 w-3.5" aria-hidden /> : <ArrowUpAZ className="h-3.5 w-3.5" aria-hidden />}
          {sort === "newest" ? "Newest" : "Oldest"}
        </button>
      </div>

      <div className="flex flex-col gap-5 px-5 pb-8">
        {loading ? <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p> : null}
        {!loading && error ? <LoadRetry message={error} onRetry={() => void load()} /> : null}
        {!loading && !error && filtered.length === 0 ? (
          <TrackEmpty filter={tab} hasAnyReports={hasAnyReports} hasQuery={Boolean(query.trim())} hasCategory={category !== "all"} />
        ) : null}
        {!loading &&
          !error &&
          filtered.map((r) => (
            <Link key={r.id} to={`/r/${r.id}`} onClick={() => track("track_open_report", { id: r.id })}>
              <SoftCard className="p-4 transition hover:border-border hover:bg-muted/15">
                <div className="flex items-start justify-between gap-3">
                  <StatusBadge status={r.status} />
                  <SeverityBadge severity={r.severity} />
                </div>
                <div className="mt-3 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-muted-foreground">{CATEGORY_LABEL[r.category]}</div>
                    <div className="mt-0.5 truncate text-[15px] font-medium">{r.title}</div>
                  </div>
                </div>
                <div className="mt-2.5 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{r.confirmCount} confirms</span>
                  <span className="text-xs text-muted-foreground">{r.updatedLabel ?? "Recently updated"}</span>
                </div>
              </SoftCard>
            </Link>
          ))}
      </div>
    </div>
  );
}

function TrackEmpty({
  filter,
  hasAnyReports,
  hasQuery,
  hasCategory,
}: {
  filter: TabFilter;
  hasAnyReports: boolean;
  hasQuery: boolean;
  hasCategory: boolean;
}) {
  const reportCta = (
    <Link to="/report" className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
      Report an issue
    </Link>
  );

  if (hasQuery || hasCategory) {
    return (
      <div className="flex flex-col items-center px-6 py-12 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-muted/50">
          <Search className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
        </div>
        <h3 className="mt-5 text-[17px] font-semibold tracking-tight text-foreground">No matches</h3>
        <p className="mt-2 max-w-[300px] text-[15px] leading-snug text-muted-foreground">Try a different search or clear filters.</p>
      </div>
    );
  }

  if (filter === "resolved") {
    return (
      <div className="flex flex-col items-center px-6 py-16 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted">
          <CheckCircle2 className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
        </div>
        <h3 className="mt-5 text-[17px] font-semibold leading-snug tracking-tight text-foreground">No resolved reports</h3>
        <p className="mt-2 max-w-[300px] text-[15px] leading-snug text-muted-foreground">
          When a case you filed is marked resolved, it will appear in this list.
        </p>
        <div className="mt-6">{reportCta}</div>
      </div>
    );
  }

  if (filter === "active" && hasAnyReports) {
    return (
      <div className="flex flex-col items-center px-6 py-16 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted">
          <ListChecks className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
        </div>
        <h3 className="mt-5 text-[17px] font-semibold leading-snug tracking-tight text-foreground">Nothing in progress</h3>
        <p className="mt-2 max-w-[300px] text-[15px] leading-snug text-muted-foreground">
          You don&apos;t have any open reports. Check the Resolved tab for closed cases.
        </p>
        <div className="mt-6">{reportCta}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted">
        <Inbox className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
      </div>
      <h3 className="mt-5 text-[17px] font-semibold leading-snug tracking-tight text-foreground">No reports yet</h3>
      <p className="mt-2 max-w-[300px] text-[15px] leading-snug text-muted-foreground">File your first issue to see it here and on the map.</p>
      <div className="mt-6">{reportCta}</div>
    </div>
  );
}
