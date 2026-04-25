import { PageHeader } from "@/components/ui-kit";
import { HowPriorityWorksContent } from "@/components/HowPriorityWorksContent";

export default function Urgency() {
  return (
    <div>
      <PageHeader title="How priority works" subtitle="Why some reports move faster than others" back backTo="/profile" />
      <HowPriorityWorksContent />
    </div>
  );
}
