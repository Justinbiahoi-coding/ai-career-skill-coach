"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lightbulb, RotateCcw, Target, ThumbsUp, Trophy } from "lucide-react";
import { Mascot } from "@/components/mascot";
import { PageShell } from "@/components/game/page-shell";
import { XpBar } from "@/components/game/xp-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { loadFullInterviewScore, loadXp } from "@/lib/session-store";
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
  const [score, setScore] = useState<FullInterviewScoreResult | null>(null);
  const [checkedStorage, setCheckedStorage] = useState(false);
  const [xp, setXp] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setScore(loadFullInterviewScore());
    setXp(loadXp());
    setCheckedStorage(true);
  }, []);

  if (checkedStorage && !score) {
    return (
      <PageShell step="result">
        <div className="flex flex-col items-center gap-4 py-10 text-center">
          <p className="text-muted-foreground text-sm">
            No full interview result saved for this session.
          </p>
          <Button
            size="lg"
            className="clay-press rounded-xl font-bold"
            onClick={() => router.push("/gap")}
          >
            Back to skills
          </Button>
        </div>
      </PageShell>
    );
  }

  if (!score) {
    return (
      <PageShell step="result">
        <div className="text-muted-foreground py-16 text-center text-sm">Loading...</div>
      </PageShell>
    );
  }

  // Fallback scores are placeholders, so the celebration is held back — a
  // trophy over an invented number would be congratulating nothing.
  const isStrong = !score.usedFallback && score.overallReadiness >= 7;

  const sections = [
    { title: "Strengths", icon: ThumbsUp, body: score.strengths, tone: "success" as const },
    { title: "Biggest gaps", icon: Target, body: score.gaps, tone: "warning" as const },
    { title: "What to do next", icon: Lightbulb, body: score.overallFeedback, tone: "primary" as const },
  ];

  return (
    <PageShell step="result" xp={xp}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <Mascot
            mood={isStrong ? "happy" : "encourage"}
            size="xl"
            className="animate-pop"
            priority
          />
          <div className="flex flex-col gap-1.5">
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Full interview complete
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Here&apos;s how ready you look for this job overall.
            </p>
          </div>
        </div>

        <Card
          className={cn(
            "clay-press border-2",
            isStrong ? "border-success bg-success-muted/30" : "border-border"
          )}
        >
          <CardContent className="flex flex-col items-center gap-3 py-6">
            {score.usedFallback && (
              <p className="rounded-xl bg-warning-muted px-3 py-2 text-xs font-semibold text-warning-foreground">
                The AI interviewer failed to score this session, so these are placeholder numbers.
              </p>
            )}

            <div className="flex items-center gap-2">
              {isStrong && <Trophy className="size-6 text-success" aria-hidden="true" />}
              <span className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                {readinessLabel(score.overallReadiness)}
              </span>
            </div>

            <span className="animate-count-up text-5xl font-extrabold tabular-nums">
              {score.overallReadiness}
              <span className="text-2xl text-muted-foreground">/10</span>
            </span>

            <XpBar
              value={score.overallReadiness}
              max={10}
              tone={isStrong ? "success" : "primary"}
              className="w-full max-w-xs"
            />
          </CardContent>
        </Card>

        {sections.map(({ title, icon: Icon, body, tone }) => (
          <Card key={title} className="clay-press">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Icon
                  className={cn(
                    "size-4",
                    tone === "success" && "text-success",
                    tone === "warning" && "text-warning",
                    tone === "primary" && "text-primary"
                  )}
                  aria-hidden="true"
                />
                {title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{body}</p>
            </CardContent>
          </Card>
        ))}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            size="lg"
            variant="outline"
            className="h-12 flex-1 rounded-xl font-bold"
            onClick={() => router.push("/gap")}
          >
            <ArrowLeft className="size-5" aria-hidden="true" />
            Back to skills
          </Button>
          <Button
            size="lg"
            className="clay-press h-12 flex-1 rounded-xl font-extrabold"
            onClick={() => router.push("/")}
          >
            <RotateCcw className="size-5" aria-hidden="true" />
            Try a new job
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
