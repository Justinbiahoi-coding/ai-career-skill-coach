"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, MoveRight, RotateCcw, TrendingUp } from "lucide-react";
import { MascotSays } from "@/components/game/mascot-says";
import { PageShell } from "@/components/game/page-shell";
import { XpBar } from "@/components/game/xp-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { loadInterviewScore, loadSelectedGap, loadXp } from "@/lib/session-store";
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
  const [xp, setXp] = useState(0);

  useEffect(() => {
    const selectedGap = loadSelectedGap();
    const score = loadInterviewScore();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setData(selectedGap && score ? { selectedGap, score } : null);
    setXp(loadXp());
    setCheckedStorage(true);
  }, []);

  if (checkedStorage && !data) {
    return (
      <PageShell step="result">
        <div className="flex flex-col items-center gap-4 py-10 text-center">
          <MascotSays mood="thinking">
            No interview result saved for this session yet.
          </MascotSays>
          <Button size="lg" className="clay-press rounded-xl font-bold" onClick={() => router.push("/")}>
            Back to start
          </Button>
        </div>
      </PageShell>
    );
  }

  if (!data) {
    return (
      <PageShell step="result">
        <div className="text-muted-foreground py-16 text-center text-sm">Loading...</div>
      </PageShell>
    );
  }

  const { selectedGap, score } = data;
  const beforeScore = confidenceTo10(selectedGap.confidenceRating);
  const afterScore = average(score.clarity, score.relevance, score.confidence);
  const improved = afterScore > beforeScore;

  const breakdown = [
    { label: "Clarity", value: score.clarity },
    { label: "Relevance", value: score.relevance },
    { label: "Confidence", value: score.confidence },
  ];

  return (
    <PageShell step="result" xp={xp}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Your result</h1>
            <Badge className="text-xs">{selectedGap.skill.name}</Badge>
          </div>
          {/* Khi điểm "after" là số giả lập (AI chấm điểm lỗi), KHÔNG được rút
              ra kết luận so sánh — làm vậy là trình bày một nhận định bịa như
              thể có thật. Nói thẳng là chưa so sánh được. */}
          <MascotSays mood={score.usedFallback ? "thinking" : improved ? "happy" : "encourage"}>
            {score.usedFallback
              ? "I couldn't score this session, so there's no real comparison to make yet — worth another go once the AI coach is back."
              : improved
                ? "You came out higher than you rated yourself — you're more ready for this than you thought."
                : "You landed at or below your own estimate. That's useful to know now rather than in the real interview."}
          </MascotSays>
        </div>

        <Card className="clay-press">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="size-4 text-primary" aria-hidden="true" />
              Before vs. after
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-around gap-2 text-center">
              <div className="flex flex-col items-center gap-1">
                <span className="text-muted-foreground text-xs font-semibold">
                  You guessed
                </span>
                <span className="text-3xl font-extrabold tabular-nums text-muted-foreground">
                  {beforeScore}
                </span>
                <span className="text-muted-foreground text-[11px]">out of 10</span>
              </div>

              <MoveRight className="text-muted-foreground size-6 shrink-0" aria-hidden="true" />

              <div className="flex flex-col items-center gap-1">
                <span className="text-muted-foreground text-xs font-semibold">
                  You scored
                </span>
                <span className="animate-count-up text-primary text-4xl font-extrabold tabular-nums">
                  {afterScore}
                </span>
                <span className="text-muted-foreground text-[11px]">out of 10</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="clay-press">
          <CardHeader>
            <CardTitle className="text-base">Interview breakdown</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {score.usedFallback && (
              <p className="rounded-xl bg-warning-muted px-3 py-2 text-xs font-semibold text-warning-foreground">
                The AI interviewer failed to score this session, so these are placeholder numbers.
              </p>
            )}

            <div className="flex flex-col gap-3">
              {breakdown.map((item) => (
                <XpBar
                  key={item.label}
                  value={item.value}
                  max={10}
                  label={item.label}
                  caption={`${item.value} / 10`}
                  tone={item.value >= 7 ? "success" : "primary"}
                />
              ))}
            </div>

            <p className="text-sm leading-relaxed">{score.overallFeedback}</p>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            size="lg"
            variant="outline"
            className="h-12 flex-1 rounded-xl font-bold"
            onClick={() => router.push("/gap")}
          >
            <ArrowRight className="size-5" aria-hidden="true" />
            Practice another skill
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
