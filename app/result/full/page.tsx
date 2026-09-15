"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { loadFullInterviewScore } from "@/lib/session-store";
import type { FullInterviewScoreResult } from "@/lib/types";

export default function FullResultPage() {
  const router = useRouter();
  const [score, setScore] = useState<FullInterviewScoreResult | null>(null);
  const [checkedStorage, setCheckedStorage] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setScore(loadFullInterviewScore());
    setCheckedStorage(true);
  }, []);

  if (checkedStorage && !score) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 px-4 py-16 text-center">
        <p className="text-muted-foreground text-sm">
          No full interview result found for this session.
        </p>
        <Button onClick={() => router.push("/gap")}>Back to skills</Button>
      </div>
    );
  }

  if (!score) {
    return (
      <div className="mx-auto flex w-full max-w-2xl px-4 py-16 text-center text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10">
      <div className="flex flex-col gap-2 text-center sm:text-left">
        <h1 className="text-2xl font-semibold tracking-tight">🎯 Full Interview Results</h1>
        <p className="text-muted-foreground text-sm">
          How ready you seem for this job overall, based on the full interview.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Overall readiness</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-2">
          {score.usedFallback && (
            <p className="text-sm text-amber-600">
              The AI interviewer failed to score this session, so these are placeholder numbers.
            </p>
          )}
          <span className="text-4xl font-semibold">{score.overallReadiness}/10</span>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Strengths</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{score.strengths}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Biggest gaps</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{score.gaps}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Feedback & next step</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{score.overallFeedback}</p>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button variant="outline" className="flex-1" onClick={() => router.push("/gap")}>
          Back to skills
        </Button>
        <Button className="flex-1" onClick={() => router.push("/")}>
          Start over with a new job
        </Button>
      </div>
    </div>
  );
}
