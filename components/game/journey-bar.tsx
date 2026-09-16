import { Check } from "lucide-react"
import { cn } from "cn"

/**
 * The five-stop path through the app, shown at the top of every screen.
 *
 * Steps the learner has finished stay filled, the current one is ringed, and
 * the ones ahead stay visible rather than hidden — seeing how much is left is
 * what stops a multi-screen flow feeling open-ended.
 */

export const JOURNEY_STEPS = [
  { id: "job", label: "Job" },
  { id: "gap", label: "Gap" },
  { id: "practice", label: "Practice" },
  { id: "interview", label: "Interview" },
  { id: "result", label: "Result" },
] as const

export type JourneyStepId = (typeof JOURNEY_STEPS)[number]["id"]

export interface JourneyBarProps {
  current: JourneyStepId
  className?: string
}

export function JourneyBar({ current, className }: JourneyBarProps) {
  const currentIndex = JOURNEY_STEPS.findIndex((s) => s.id === current)

  return (
    <nav
      aria-label="Your progress"
      className={cn("flex w-full items-center gap-1.5", className)}
    >
      {JOURNEY_STEPS.map((step, index) => {
        const isDone = index < currentIndex
        const isCurrent = index === currentIndex

        return (
          <div key={step.id} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="flex w-full items-center gap-1.5">
              <span
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors",
                  isDone && "bg-success text-success-foreground",
                  isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                  !isDone && !isCurrent && "bg-muted text-muted-foreground"
                )}
              >
                {isDone ? (
                  <Check className="size-4" aria-hidden="true" />
                ) : (
                  index + 1
                )}
              </span>
              {index < JOURNEY_STEPS.length - 1 && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "h-1 flex-1 rounded-full transition-colors",
                    isDone ? "bg-success" : "bg-muted"
                  )}
                />
              )}
            </div>
            <span
              className={cn(
                "text-[11px] font-semibold",
                isCurrent ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {step.label}
              {isDone && <span className="sr-only"> (done)</span>}
              {isCurrent && <span className="sr-only"> (current step)</span>}
            </span>
          </div>
        )
      })}
    </nav>
  )
}
