import { Check } from "lucide-react";
import { cn } from "cn";

export interface StepProgressProps {
  total: number;
  /** 0-indexed. */
  current: number;
  completed: boolean[];
  className?: string;
}

/**
 * The dot rail above a practice session — same idea as the app nav but
 * scoped to steps within one card instead of screens across the whole app.
 */
export function StepProgress({ total, current, completed, className }: StepProgressProps) {
  return (
    <div
      role="progressbar"
      aria-valuenow={current + 1}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-label={`Step ${current + 1} of ${total}`}
      className={cn("flex items-center gap-1.5", className)}
    >
      {Array.from({ length: total }, (_, i) => {
        const isDone = completed[i];
        const isCurrent = i === current;
        return (
          <div
            key={i}
            className={cn(
              "flex h-2.5 flex-1 items-center justify-center rounded-full border border-carbon transition-colors",
              isDone && "bg-mint-pop",
              isCurrent && !isDone && "bg-electric-blue",
              !isDone && !isCurrent && "bg-soft-mist"
            )}
          >
            {isDone && <Check className="size-2 text-carbon" aria-hidden="true" />}
          </div>
        );
      })}
    </div>
  );
}
