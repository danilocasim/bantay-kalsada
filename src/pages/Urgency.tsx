import { PageHeader, SoftCard } from "@/components/ui-kit";

const LEVELS = [
  { name: "Low", desc: "Cosmetic or low-risk issues. Faded paint, minor cracks.", color: "bg-status-resolved" },
  { name: "Moderate", desc: "Affects flow or safety but not immediately dangerous.", color: "bg-status-pothole" },
  { name: "High", desc: "Immediate danger to vehicles or pedestrians. Open manholes, deep potholes.", color: "bg-status-urgent" },
];

export default function Urgency() {
  return (
    <div>
      <PageHeader title="How priority works" subtitle="Why some reports move faster than others" back />
      <div className="px-5 space-y-3">
        {LEVELS.map((l) => (
          <SoftCard key={l.name}>
            <div className="flex items-start gap-3">
              <div className={`h-10 w-10 rounded-xl ${l.color} shrink-0`} />
              <div>
                <div className="font-semibold text-[15px]">{l.name}</div>
                <p className="text-sm text-muted-foreground mt-1">{l.desc}</p>
              </div>
            </div>
          </SoftCard>
        ))}
      </div>
    </div>
  );
}
