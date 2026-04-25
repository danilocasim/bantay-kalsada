import { PageHeader, SoftCard, EmptyState } from "@/components/ui-kit";

const SAMPLE = [
  { group: "Report updates", items: ["Your pothole report was routed to City Engineering Office."] },
  { group: "Nearby hazards", items: ["A flooded area was reported near your saved route."] },
  { group: "Agency responses", items: ["The agency marked your report as in progress."] },
  { group: "Community", items: ["Community members confirmed your report."] },
];

export default function Notifications() {
  const empty = false;
  return (
    <div>
      <PageHeader title="Notifications" back />
      <div className="px-5 space-y-5">
        {empty ? (
          <EmptyState title="You're all caught up" subtitle="New activity will show up here." />
        ) : (
          SAMPLE.map((g) => (
            <div key={g.group}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1 mb-2">{g.group}</h3>
              <div className="space-y-2">
                {g.items.map((t) => (
                  <SoftCard key={t} className="py-3">
                    <p className="text-sm">{t}</p>
                    <p className="text-xs text-muted-foreground mt-1">Just now</p>
                  </SoftCard>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}