import Image from "next/image"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

/**
 * Job Buddy — the app's mascot.
 *
 * Rendered in Blender as a 3D model, then shipped as flat WebP frames (the same
 * approach Duolingo uses for Duo): no 3D runtime in the browser, ~16KB a frame.
 * Source model lives in design/mascot/jobbuddy.blend.
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

/** Which feeling the mascot shows. Each maps to a rendered frame. */
export type MascotMood = "default" | "happy" | "thinking" | "encourage"

/** Front reads as talking to the user; three-quarter reads as idle presence. */
export type MascotAngle = "front" | "tq"

/** Intrinsic pixel sizes of the rendered frames, needed by next/image. */
const FRAME_SIZE: Record<MascotAngle, { width: number; height: number }> = {
  front: { width: 440, height: 460 },
  tq: { width: 440, height: 537 },
}

const ALT_TEXT: Record<MascotMood, string> = {
  default: "Job Buddy waving hello",
  happy: "Job Buddy cheering",
  thinking: "Job Buddy thinking it over",
  encourage: "Job Buddy giving a thumbs up",
}

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
  mood = "default",
  angle = "front",
  size,
  className,
  decorative = false,
  priority = false,
}: MascotProps) {
  const { width, height } = FRAME_SIZE[angle]

  return (
    <Image
      src={`/mascot/mascot-${mood}-${angle}.webp`}
      alt={decorative ? "" : ALT_TEXT[mood]}
      aria-hidden={decorative || undefined}
      width={width}
      height={height}
      priority={priority}
      className={cn(mascotVariants({ size }), "h-auto", className)}
    />
  )
}
