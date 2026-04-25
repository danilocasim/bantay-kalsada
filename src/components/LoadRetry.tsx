import { AlertCircle } from "lucide-react";

export function LoadRetry({
  message,
  onRetry,
  className = "",
}: {
  message: string;
  onRetry: () => void;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-border bg-muted/30 px-4 py-4 ${className}`}>
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-muted-foreground">
          <AlertCircle className="h-5 w-5" strokeWidth={2} aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">{message}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-[1.03]"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
