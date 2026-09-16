"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpen, Loader2, PenLine, Send, Sparkles, Star } from "lucide-react";
import { MascotSays } from "@/components/game/mascot-says";
import { PageShell } from "@/components/game/page-shell";
import { XpBar } from "@/components/game/xp-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { addXp, loadExtractedSkills, loadSelectedGap, loadXp } from "@/lib/session-store";
import { cn } from "cn";
import type { GenerateLessonResult, GradeExerciseResult, Skill } from "@/lib/types";

const MAX_ANSWER_LENGTH = 2000;
// XP mỗi lần chấm bài. Khi phần practice tương tác được làm chi tiết, từng
// bước nhỏ sẽ cộng XP riêng thay vì dồn hết vào một lần như hiện tại.
const XP_PER_EXERCISE = 20;

interface LearnContext {
  skill: Skill;
  jdText: string;
}

export default function LearnPage() {
  const router = useRouter();
  const [context, setContext] = useState<LearnContext | null>(null);
  const [checkedStorage, setCheckedStorage] = useState(false);
  const [xp, setXp] = useState(0);

  const [lesson, setLesson] = useState<GenerateLessonResult | null>(null);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [lessonError, setLessonError] = useState<string | null>(null);

  const [answer, setAnswer] = useState("");
  const [grade, setGrade] = useState<GradeExerciseResult | null>(null);
  const [gradeLoading, setGradeLoading] = useState(false);
  const [gradeError, setGradeError] = useState<string | null>(null);

  useEffect(() => {
    const selectedGap = loadSelectedGap();
    const extracted = loadExtractedSkills();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setContext(
      selectedGap && extracted ? { skill: selectedGap.skill, jdText: extracted.jdText } : null
    );
    setXp(loadXp());
    setCheckedStorage(true);
  }, []);

  useEffect(() => {
    if (!context) return;

    let cancelled = false;
    // Reset loading/error state right as the fetch starts (standard data-fetch
    // pattern) — the actual result is set later inside the async .then/.catch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLessonLoading(true);
    setLessonError(null);

    fetch("/api/generate-lesson", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skillName: context.skill.name, jdText: context.jdText }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? "Request failed");
        }
        return res.json();
      })
      .then((data: GenerateLessonResult) => {
        if (!cancelled) setLesson(data);
      })
      .catch((err) => {
        if (!cancelled) setLessonError(err instanceof Error ? err.message : "Something went wrong");
      })
      .finally(() => {
        if (!cancelled) setLessonLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [context]);

  async function handleSubmitAnswer() {
    if (!context || !lesson || !answer.trim()) return;
    setGradeLoading(true);
    setGradeError(null);

    try {
      const res = await fetch("/api/grade-exercise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skillName: context.skill.name,
          exercisePrompt: lesson.exercisePrompt,
          userAnswer: answer,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Request failed");
      }

      const data: GradeExerciseResult = await res.json();
      setGrade(data);
      // Chỉ thưởng XP khi AI chấm thật. Điểm fallback là số giả lập, thưởng
      // XP cho nó là dựng lên một thành tích không có thật.
      if (!data.usedFallback) {
        setXp(addXp(XP_PER_EXERCISE));
      }
    } catch (err) {
      setGradeError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setGradeLoading(false);
    }
  }

  function handleGoToInterview() {
    router.push("/interview");
  }

  if (checkedStorage && !context) {
    return (
      <PageShell step="practice">
        <div className="flex flex-col items-center gap-4 py-10 text-center">
          <MascotSays mood="thinking">
            No skill picked for this session yet. Let&apos;s go back and choose one.
          </MascotSays>
          <Button size="lg" className="clay-press rounded-xl font-bold" onClick={() => router.push("/")}>
            Back to start
          </Button>
        </div>
      </PageShell>
    );
  }

  if (!context) {
    return (
      <PageShell step="practice">
        <div className="text-muted-foreground py-16 text-center text-sm">Loading...</div>
      </PageShell>
    );
  }

  const scoredWell = grade ? grade.score >= 7 : false;

  return (
    <PageShell step="practice" xp={xp}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Practice</h1>
            <Badge className="text-xs">{context.skill.name}</Badge>
          </div>
          <MascotSays mood={grade ? (scoredWell ? "happy" : "encourage") : "default"}>
            {grade
              ? scoredWell
                ? "Nice work — that answer holds up. Ready to try it under interview pressure?"
                : "Good start. Read the feedback below, then let's put it to the test in a mock interview."
              : "Here's a short lesson built around this exact job, then one exercise to try it yourself."}
          </MascotSays>
        </div>

        <XpBar
          value={grade ? 2 : lesson ? 1 : 0}
          max={2}
          label="This session"
          caption={grade ? "Exercise done" : lesson ? "Lesson ready" : "Loading"}
        />

        <Card className="clay-press">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="size-4 text-primary" aria-hidden="true" />
              Lesson
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lessonLoading && (
              <div className="flex flex-col gap-2" aria-live="polite">
                <span className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Writing a lesson for this job...
                </span>
                {/* Skeleton lines keep the card at a stable height, so the
                    page doesn't jump when the real text arrives. */}
                <div className="flex flex-col gap-2" aria-hidden="true">
                  {[100, 92, 96, 70].map((w, i) => (
                    <div
                      key={i}
                      className="h-3 animate-pulse rounded-full bg-muted"
                      style={{ width: `${w}%` }}
                    />
                  ))}
                </div>
              </div>
            )}
            {lessonError && (
              <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
                {lessonError}
              </p>
            )}
            {lesson && (
              <div className="flex flex-col gap-3">
                {lesson.usedFallback && (
                  <p className="rounded-xl bg-warning-muted px-3 py-2 text-xs font-semibold text-warning-foreground">
                    The AI coach didn&apos;t respond, so this is offline sample content.
                  </p>
                )}
                <p className="text-sm leading-relaxed whitespace-pre-line">{lesson.lessonText}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {lesson && (
          <Card className="clay-press">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <PenLine className="size-4 text-primary" aria-hidden="true" />
                Your turn
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="rounded-xl bg-accent/50 px-4 py-3 text-sm font-semibold leading-relaxed">
                {lesson.exercisePrompt}
              </p>
              <Textarea
                placeholder="Write your answer here..."
                value={answer}
                maxLength={MAX_ANSWER_LENGTH}
                aria-label="Your answer to the exercise"
                onChange={(e) => setAnswer(e.target.value)}
                className="min-h-[140px] rounded-xl text-sm leading-relaxed"
              />
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground text-xs font-bold tabular-nums">
                  {answer.length}/{MAX_ANSWER_LENGTH}
                </span>
                <Button
                  size="lg"
                  className="clay-press h-11 rounded-xl font-extrabold"
                  onClick={handleSubmitAnswer}
                  disabled={gradeLoading || !answer.trim()}
                >
                  {gradeLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                      Grading
                    </>
                  ) : (
                    <>
                      <Send className="size-4" aria-hidden="true" />
                      Submit answer
                    </>
                  )}
                </Button>
              </div>
              {gradeError && (
                <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
                  {gradeError}
                </p>
              )}

              {grade && (
                <div
                  className="animate-pop flex flex-col gap-3 border-t border-border pt-4"
                  aria-live="polite"
                >
                  {grade.usedFallback && (
                    <p className="rounded-xl bg-warning-muted px-3 py-2 text-xs font-semibold text-warning-foreground">
                      The AI grader didn&apos;t respond, so this is a placeholder score — no XP for
                      it.
                    </p>
                  )}

                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex size-14 shrink-0 flex-col items-center justify-center rounded-2xl font-extrabold tabular-nums",
                        scoredWell
                          ? "bg-success text-success-foreground"
                          : "bg-warning text-warning-foreground"
                      )}
                    >
                      <span className="text-lg leading-none">{grade.score}</span>
                      <span className="text-[10px] leading-none opacity-80">/ 10</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-extrabold">
                        {scoredWell ? "Strong answer" : "Room to sharpen"}
                      </span>
                      {!grade.usedFallback && (
                        <span className="text-xp flex items-center gap-1 text-xs font-bold">
                          <Star className="size-3.5" aria-hidden="true" />+{XP_PER_EXERCISE} XP
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed">{grade.feedback}</p>

                  <Button
                    size="lg"
                    className="clay-press h-12 rounded-xl text-base font-extrabold"
                    onClick={handleGoToInterview}
                  >
                    <Sparkles className="size-5" aria-hidden="true" />
                    Try a mock interview
                    <ArrowRight className="size-5" aria-hidden="true" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </PageShell>
  );
}
