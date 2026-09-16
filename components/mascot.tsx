import Image from "next/image"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

/**
 * The Joblingo mascot.
 *
 * A single static brand illustration (see public/brand/joblingo-mascot.webp),
 * used everywhere the app previously rendered one of 8 mood/angle frames of
 * the old "Job Buddy" 3D-render mascot. `mood` and `angle` are kept as props
 * so every existing call site (<Mascot mood="happy" angle="tq" />, etc.)
 * keeps compiling unchanged — they're accepted but no longer change which
 * image renders, since there's just the one now.
 */

const mascotVariants = cva("select-none", {
  variants: {
    size: {
      sm: "w-16",
      default: "w-24",
      lg: "w-36",
      xl: "w-52",
    },
  },
  defaultVariants: {
    size: "default",
  },
})

/** Kept for call-site compatibility; no longer changes which image renders. */
export type MascotMood = "default" | "happy" | "thinking" | "encourage"

/** Kept for call-site compatibility; no longer changes which image renders. */
export type MascotAngle = "front" | "tq"

/** Intrinsic pixel size of the mascot artwork, needed by next/image. */
const MASCOT_SRC = "/brand/joblingo-mascot.webp"
const MASCOT_WIDTH = 600
const MASCOT_HEIGHT = 600

export interface MascotProps
  extends VariantProps<typeof mascotVariants> {
  mood?: MascotMood
  angle?: MascotAngle
  className?: string
  /** Set when the mascot is purely decorative next to text that already says the same thing. */
  decorative?: boolean
  priority?: boolean
}

export function Mascot({
  size,
  className,
  decorative = false,
  priority = false,
}: MascotProps) {
  return (
    <Image
      src={MASCOT_SRC}
      alt={decorative ? "" : "Joblingo mascot"}
      aria-hidden={decorative || undefined}
      width={MASCOT_WIDTH}
      height={MASCOT_HEIGHT}
      priority={priority}
      className={cn(mascotVariants({ size }), "h-auto", className)}
    />
  )
}
