"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lightbulb, RotateCcw, Target, ThumbsUp, Trophy } from "lucide-react";
import { motion } from "motion/react";
import { Mascot } from "@/components/mascot";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { loadFullInterviewScore } from "@/lib/session-store";
import { cn } from "cn";
import type { FullInterviewScoreResult } from "@/lib/types";

/** Plain-language band for a 0-10 readiness score, so the number lands with meaning. */
function readinessLabel(score: number): string {
  if (score >= 8) return "Interview ready";
  if (score >= 6) return "Nearly there";
  if (score >= 4) return "Getting started";
  return "Early days";
}

export default function FullResultPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null | undefined>(undefined);
  const [score, setScore] = useState<FullInterviewScoreResult | null>(null);
  const [checkedStorage, setCheckedStorage] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null));

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setScore(loadFullInterviewScore());
    setCheckedStorage(true);
  }, []);

  if (checkedStorage && !score) {
    return (
      <div className="flex min-h-screen flex-col bg-sky-wash">
        <LandingNavbar userEmail={userEmail} />
        <main className="mx-auto flex w-full max-w-[720px] flex-1 flex-col items-center justify-center gap-4 px-5 py-12 text-center">
          <p className="font-aeonik text-base font-medium text-carbon/80">
            No full interview result saved for this session.
          </p>
          <Button
            size="lg"
            className="h-12 rounded-full border border-carbon bg-carbon font-aeonik font-bold text-paper-white hover:bg-carbon/85"
            onClick={() => router.push("/gap")}
          >
            Back to skills
          </Button>
        </main>
      </div>
    );
  }

  if (!score) {
    return (
      <div className="flex min-h-screen flex-col bg-sky-wash">
        <LandingNavbar userEmail={userEmail} />
        <main className="mx-auto flex w-full max-w-[720px] flex-1 items-center justify-center px-5 py-16">
          <p className="font-aeonik text-sm font-medium text-carbon/60">Loading...</p>
        </main>
      </div>
    );
  }

  // Fallback scores are placeholders, so the celebration is held back — a
  // trophy over an invented number would be congratulating nothing.
  const isStrong = !score.usedFallback && score.overallReadiness >= 7;

  const sections = [
    { title: "Strengths", icon: ThumbsUp, body: score.strengths, sticker: "bg-mint-pop" },
    { title: "Biggest gaps", icon: Target, body: score.gaps, sticker: "bg-sunburst" },
    { title: "What to do next", icon: Lightbulb, body: score.overallFeedback, sticker: "bg-sky-wash" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-sky-wash">
      <LandingNavbar userEmail={userEmail} />

      <main className="mx-auto flex w-full max-w-[720px] flex-1 flex-col gap-6 px-5 py-12 sm:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <Mascot mood={isStrong ? "happy" : "encourage"} size="xl" className="animate-pop" priority />
          <div className="flex flex-col gap-1.5">
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="font-lateral text-[clamp(28px,6vw,44px)] font-extrabold uppercase leading-[0.85] text-carbon"
            >
              Full interview
              <br />
              complete
            </motion.h1>
            <p className="font-aeonik text-sm font-medium leading-relaxed text-carbon/70">
              Here&apos;s how ready you look for this job overall.
            </p>
          </div>
        </div>

        <div
          className={cn(
            "flex flex-col items-center gap-3 rounded-[30px] border border-carbon p-6 py-8",
            isStrong ? "bg-mint-pop/30" : "bg-paper-white"
          )}
        >
          {score.usedFallback && (
            <p className="rounded-[16px] border border-carbon bg-sunburst px-3.5 py-2.5 font-aeonik text-xs font-bold text-carbon">
              The AI interviewer failed to score this session, so these are placeholder numbers.
            </p>
          )}

          <div className="flex items-center gap-2">
            {isStrong && <Trophy className="size-6 text-carbon" aria-hidden="true" />}
            <span className="font-aeonik text-sm font-bold tracking-[0.02em] text-carbon/60 uppercase">
              {readinessLabel(score.overallReadiness)}
            </span>
          </div>

          <span className="animate-count-up font-aeonik text-5xl font-extrabold tabular-nums text-carbon">
            {score.overallReadiness}
            <span className="text-2xl text-carbon/50">/10</span>
          </span>

          <div className="h-3 w-full max-w-xs overflow-hidden rounded-full border border-carbon bg-soft-mist">
            <div
              className={cn(
                "h-full rounded-full transition-[width] duration-500 ease-out",
                isStrong ? "bg-mint-pop" : "bg-electric-blue"
              )}
              style={{ width: `${(score.overallReadiness / 10) * 100}%` }}
            />
          </div>
        </div>

        {sections.map(({ title, icon: Icon, body, sticker }) => (
          <div
            key={title}
            className={cn("flex flex-col gap-2 rounded-[20px] border border-carbon p-5", sticker)}
          >
            <div className="flex items-center gap-2">
              <Icon className="size-4 text-carbon" aria-hidden="true" />
              <span className="font-aeonik text-base font-extrabold text-carbon">{title}</span>
            </div>
            <p className="font-aeonik text-sm leading-relaxed text-carbon/80">{body}</p>
          </div>
        ))}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            size="lg"
            variant="outline"
            className="h-12 flex-1 rounded-full border border-carbon bg-paper-white font-aeonik font-bold text-carbon hover:bg-soft-mist"
            onClick={() => router.push("/gap")}
          >
            <ArrowLeft className="size-5" aria-hidden="true" />
            Back to skills
          </Button>
          <Button
            size="lg"
            className="h-12 flex-1 rounded-full border border-carbon bg-carbon font-aeonik font-extrabold text-paper-white hover:bg-carbon/85"
            onClick={() => router.push("/job")}
          >
            <RotateCcw className="size-5" aria-hidden="true" />
            Try a new job
          </Button>
        </div>
      </main>
    </div>
  );
}
