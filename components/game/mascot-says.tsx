import { Mascot, type MascotMood } from "@/components/mascot"
import { cn } from "cn"

/**
 * Job Buddy with a speech bubble.
 *
 * This is how the app talks to the learner — guidance, praise and corrections
 * come from the character rather than from unattributed interface copy, which
 * is what makes a coaching product feel like a coach.
 */

export interface MascotSaysProps {
  children: React.ReactNode
  mood?: MascotMood
  /** Smaller mascot and tighter bubble, for use inside a card. */
  compact?: boolean
  className?: string
}

export function MascotSays({
  children,
  mood = "default",
  compact = false,
  className,
}: MascotSaysProps) {
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <Mascot
        mood={mood}
        size={compact ? "sm" : "default"}
        className="shrink-0 animate-float"
        decorative
      />
      <div
        className={cn(
          // The notch is a rotated square behind the bubble's left edge, so it
          // inherits the bubble's own background and border in both themes.
          "relative flex-1 rounded-2xl border border-border bg-card px-4 py-3 text-sm leading-relaxed",
          "before:absolute before:top-5 before:-left-[7px] before:size-3 before:rotate-45",
          "before:border-b before:border-l before:border-border before:bg-card",
          compact && "px-3 py-2 text-[13px]"
        )}
      >
        {children}
      </div>
    </div>
  )
}
