import { SoftCard } from "@/components/ui-kit";

const LEVELS = [
  {
    name: "Low",
    desc: "Cosmetic or low-risk issues. Faded paint, minor cracks.",
    swatch: "bg-status-resolved",
  },
  {
    name: "Moderate",
    desc: "Affects traffic flow or safety but is not an immediate emergency.",
    swatch: "bg-status-moderate",
  },
  {
    name: "High",
    desc: "Immediate danger to vehicles or pedestrians. Open manholes, deep potholes, unsafe flooding.",
    swatch: "bg-status-urgent",
  },
] as const;

/** Shared copy for the full-page route and the profile bottom sheet. */
export function HowPriorityWorksContent() {
  return (
    <div className="space-y-5 px-5 pb-10 pt-4">
      <p className="text-[15px] leading-relaxed text-muted-foreground">
        Severity is about how risky the issue looks. It works alongside status (Submitted, In progress, Resolved, and so on), which tracks what the agency has done.
      </p>
      <div className="space-y-3">
        {LEVELS.map((level) => (
          <SoftCard key={level.name} className="p-4">
            <div className="flex items-start gap-3">
              <div className={`h-10 w-10 shrink-0 rounded-xl ring-1 ring-border/80 ${level.swatch}`} aria-hidden />
              <div className="min-w-0">
                <div className="text-[15px] font-semibold text-foreground">{level.name}</div>
                <p className="mt-1 text-sm leading-snug text-muted-foreground">{level.desc}</p>
              </div>
            </div>
          </SoftCard>
        ))}
      </div>
    </div>
  );
}
