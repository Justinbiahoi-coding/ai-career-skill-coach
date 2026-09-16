"use client"

import Link from "next/link"
import { GraduationCap } from "lucide-react"
import { JourneyBar, type JourneyStepId } from "@/components/game/journey-bar"
import { StatPill } from "@/components/game/stat-pill"
import { cn } from "cn"

/**
 * The frame every screen sits in: brand row, live stats, journey bar.
 *
 * Keeping the header identical across screens is what lets the learner read
 * their XP and streak without hunting for it, and the sticky offset accounts
 * for the safe-area inset so the bar clears a notch on phones.
 */

export interface PageShellProps {
  step: JourneyStepId
  children: React.ReactNode
  /** Hidden until the learner has actually earned something. */
  xp?: number
  streak?: number
  className?: string
}

export function PageShell({ step, children, xp, streak, className }: PageShellProps) {
  return (
    <div className="flex min-h-full flex-col">
      <header
        className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur-md"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-3 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/"
              className="flex min-h-11 items-center gap-2 rounded-lg font-extrabold tracking-tight outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <span className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <GraduationCap className="size-5" aria-hidden="true" />
              </span>
              <span className="text-[15px]">Skill Coach</span>
            </Link>

            <div className="flex items-center gap-2">
              {typeof streak === "number" && streak > 0 && (
                <StatPill tone="streak" value={streak} label={`${streak} day streak`} />
              )}
              {typeof xp === "number" && xp > 0 && (
                <StatPill tone="xp" value={xp} label={`${xp} XP earned`} />
              )}
            </div>
          </div>

          <JourneyBar current={step} />
        </div>
      </header>

      <main
        className={cn("mx-auto w-full max-w-2xl flex-1 px-4 py-6", className)}
        style={{ paddingBottom: "calc(2rem + env(safe-area-inset-bottom, 0px))" }}
      >
        {children}
      </main>
    </div>
  )
}
