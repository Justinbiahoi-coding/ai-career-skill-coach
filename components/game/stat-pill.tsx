import { cva, type VariantProps } from "class-variance-authority"
import { Flame, Star, Trophy, Target } from "lucide-react"
import { cn } from "cn"

/**
 * A compact stat readout (XP, streak, skills done) for the app header.
 *
 * Each stat pairs an icon with its number so the meaning survives without
 * colour, and the number is tabular so a counter ticking up doesn't reflow
 * the pills next to it.
 */

const pillVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold tabular-nums",
  {
    variants: {
      tone: {
        xp: "bg-xp-muted text-warning-foreground dark:text-xp",
        streak: "bg-streak-muted text-warning-foreground dark:text-streak",
        progress: "bg-secondary text-secondary-foreground",
        trophy: "bg-success-muted text-success-foreground dark:text-success",
      },
    },
    defaultVariants: { tone: "xp" },
  }
)

const ICONS = {
  xp: Star,
  streak: Flame,
  progress: Target,
  trophy: Trophy,
} as const

export interface StatPillProps extends VariantProps<typeof pillVariants> {
  value: string | number
  /** Spoken by screen readers in place of the bare number, e.g. "120 XP earned". */
  label: string
  className?: string
}

export function StatPill({ tone = "xp", value, label, className }: StatPillProps) {
  const Icon = ICONS[tone ?? "xp"]

  return (
    <span className={cn(pillVariants({ tone }), className)}>
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      <span aria-hidden="true">{value}</span>
      <span className="sr-only">{label}</span>
    </span>
  )
}
