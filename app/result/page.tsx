"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { loadInterviewScore, loadSelectedGap } from "@/lib/session-store";
import type { InterviewScoreResult, SelectedGap } from "@/lib/types";

interface ResultData {
  selectedGap: SelectedGap;
  score: InterviewScoreResult;
}

// Self-rating trước lúc luyện là thang 1-5; quy đổi sang thang 0-10 để so
// sánh trực quan cạnh điểm phỏng vấn (cũng 0-10) trên cùng một trục.
function confidenceTo10(rating: number): number {
  return rating * 2;
}

function average(a: number, b: number, c: number): number {
  return Math.round(((a + b + c) / 3) * 10) / 10;
}

export default function ResultPage() {
  const router = useRouter();
  const [data, setData] = useState<ResultData | null>(null);
  const [checkedStorage, setCheckedStorage] = useState(false);

  useEffect(() => {
    const selectedGap = loadSelectedGap();
    const score = loadInterviewScore();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setData(selectedGap && score ? { selectedGap, score } : null);
    setCheckedStorage(true);
  }, []);

  if (checkedStorage && !data) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 px-4 py-16 text-center">
        <p className="text-muted-foreground text-sm">
          No interview result found for this session. Start from the beginning.
        </p>
        <Button onClick={() => router.push("/")}>Back to start</Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto flex w-full max-w-2xl px-4 py-16 text-center text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  const { selectedGap, score } = data;
  const beforeScore = confidenceTo10(selectedGap.confidenceRating);
  const afterScore = average(score.clarity, score.relevance, score.confidence);
  const improved = afterScore > beforeScore;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10">
      <div className="flex flex-col gap-2 text-center sm:text-left">
        <div className="flex items-center justify-center gap-2 sm:justify-start">
          <h1 className="text-2xl font-semibold tracking-tight">5. Results</h1>
          <Badge>{selectedGap.skill.name}</Badge>
        </div>
        <p className="text-muted-foreground text-sm">
          How you did in the mock interview for this skill.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Before vs. after</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-around text-center">
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-xs">Before (self-rating)</span>
              <span className="text-3xl font-semibold">{beforeScore}/10</span>
            </div>
            <span className="text-muted-foreground text-xl">→</span>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-xs">After (mock interview)</span>
              <span className="text-3xl font-semibold">{afterScore}/10</span>
            </div>
          </div>
          <p className="text-muted-foreground mt-4 text-center text-sm">
            {improved
              ? "Your interview performance came out higher than your initial confidence — a good sign you're more ready than you thought."
              : "Your interview performance came out at or below your initial confidence — worth another round of practice before the real thing."}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Interview breakdown</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {score.usedFallback && (
            <p className="text-sm text-amber-600">
              The AI interviewer failed to score this session, so these are placeholder numbers.
            </p>
          )}
          <div className="flex justify-around text-center">
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-xs">Clarity</span>
              <span className="text-xl font-semibold">{score.clarity}/10</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-xs">Relevance</span>
              <span className="text-xl font-semibold">{score.relevance}/10</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-xs">Confidence</span>
              <span className="text-xl font-semibold">{score.confidence}/10</span>
            </div>
          </div>
          <p className="text-sm leading-relaxed">{score.overallFeedback}</p>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button variant="outline" className="flex-1" onClick={() => router.push("/gap")}>
          Practice another skill
        </Button>
        <Button className="flex-1" onClick={() => router.push("/")}>
          Start over with a new job
        </Button>
      </div>
    </div>
  );
}
