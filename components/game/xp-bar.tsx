import { cn } from "cn"

/**
 * A labelled progress bar used for XP, lesson progress and score meters.
 *
 * Built on a plain div rather than the Base UI Progress primitive because the
 * clay look needs an inset track and a rounded fill that reaches the full
 * height — and because every use here is a simple determinate bar.
 */

export interface XpBarProps {
  /** Current amount. Clamped into range, so a caller can't overflow the fill. */
  value: number
  max: number
  label?: string
  /** Right-hand caption; defaults to "value / max". */
  caption?: string
  tone?: "primary" | "xp" | "success"
  className?: string
}

const TONE_FILL = {
  primary: "bg-primary",
  xp: "bg-xp",
  success: "bg-success",
} as const

export function XpBar({
  value,
  max,
  label,
  caption,
  tone = "primary",
  className,
}: XpBarProps) {
  const safeMax = max > 0 ? max : 1
  const clamped = Math.min(Math.max(value, 0), safeMax)
  const percent = (clamped / safeMax) * 100

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {(label || caption) && (
        <div className="flex items-baseline justify-between gap-2">
          {label && <span className="text-sm font-semibold">{label}</span>}
          <span className="text-xs font-bold tabular-nums text-muted-foreground">
            {caption ?? `${clamped} / ${safeMax}`}
          </span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-label={label ?? "Progress"}
        className="h-3 w-full overflow-hidden rounded-full bg-muted inset-shadow-2xs"
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-500 ease-out",
            TONE_FILL[tone]
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
