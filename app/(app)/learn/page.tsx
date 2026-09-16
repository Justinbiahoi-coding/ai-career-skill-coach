"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpen, Loader2, Sparkles, Star } from "lucide-react";
import { FillBlankStepView } from "@/components/practice/fill-blank-step";
import { FreeTextStepView } from "@/components/practice/free-text-step";
import { MiniDialogueStepView } from "@/components/practice/mini-dialogue-step";
import { MultipleChoiceStepView } from "@/components/practice/multiple-choice-step";
import { ReorderStepView } from "@/components/practice/reorder-step";
import { StepProgress } from "@/components/practice/step-progress";
import { MascotSays } from "@/components/game/mascot-says";
import { PageShell } from "@/components/game/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { addXp, loadExtractedSkills, loadSelectedGap, loadXp } from "@/lib/session-store";
import type { GeneratePracticeResult, PracticeStep, Skill } from "@/lib/types";

interface LearnContext {
  skill: Skill;
  jdText: string;
}

// XP per step, ramping with difficulty — the first three are graded locally
// (fixed correct answer), the last two need the model to judge an open
// answer, so they're worth more. Sums to 60, replacing the old flat 20 for
// one free-text exercise, since there's now 5x the work per skill.
const XP_BY_STEP_INDEX = [10, 10, 10, 15, 15] as const;

export default function LearnPage() {
  const router = useRouter();
  const [context, setContext] = useState<LearnContext | null>(null);
  const [checkedStorage, setCheckedStorage] = useState(false);
  const [xp, setXp] = useState(0);

  const [practice, setPractice] = useState<GeneratePracticeResult | null>(null);
  const [practiceLoading, setPracticeLoading] = useState(false);
  const [practiceError, setPracticeError] = useState<string | null>(null);

  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState<boolean[]>([]);

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPracticeLoading(true);
    setPracticeError(null);

    fetch("/api/generate-practice", {
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
      .then((data: GeneratePracticeResult) => {
        if (cancelled) return;
        setPractice(data);
        setCompleted(new Array(data.steps.length).fill(false));
      })
      .catch((err) => {
        if (!cancelled) {
          setPracticeError(err instanceof Error ? err.message : "Something went wrong");
        }
      })
      .finally(() => {
        if (!cancelled) setPracticeLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [context]);

  function handleStepDone(index: number) {
    // A retried step (wrong MCQ answer, re-submitted free-text) can call this
    // more than once; only the first success for a given step should pay out.
    setCompleted((prev) => {
      if (prev[index]) return prev;
      const next = [...prev];
      next[index] = true;
      return next;
    });
    setXp(addXp(XP_BY_STEP_INDEX[index] ?? 0));
  }

  function handleAdvance() {
    if (!practice) return;
    if (currentStep < practice.steps.length - 1) {
      setCurrentStep((i) => i + 1);
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
          <Button size="lg" className="clay-press rounded-xl font-bold" onClick={() => router.push("/job")}>
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

  const allDone = practice ? completed.every(Boolean) && completed.length > 0 : false;
  const step: PracticeStep | undefined = practice?.steps[currentStep];
  const isCurrentStepDone = completed[currentStep] ?? false;

  return (
    <PageShell step="practice" xp={xp}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Practice</h1>
            <Badge className="text-xs">{context.skill.name}</Badge>
          </div>
          <MascotSays mood={allDone ? "happy" : "default"}>
            {allDone
              ? "All 5 steps done — nice work. Ready to put it to the test in a mock interview?"
              : "A short lesson, then 5 steps that get progressively harder — right through a short back-and-forth with me."}
          </MascotSays>
        </div>

        <Card className="clay-press">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="size-4 text-primary" aria-hidden="true" />
              Lesson
            </CardTitle>
          </CardHeader>
          <CardContent>
            {practiceLoading && (
              <div className="flex flex-col gap-2" aria-live="polite">
                <span className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Building your practice session...
                </span>
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
            {practiceError && (
              <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
                {practiceError}
              </p>
            )}
            {practice && (
              <div className="flex flex-col gap-3">
                {practice.usedFallback && (
                  <p className="rounded-xl bg-warning-muted px-3 py-2 text-xs font-semibold text-warning-foreground">
                    The AI coach didn&apos;t respond, so this is offline sample content.
                  </p>
                )}
                <p className="text-sm leading-relaxed whitespace-pre-line">{practice.lessonText}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {practice && step && (
          <Card className="clay-press">
            <CardHeader className="gap-3">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-base">
                  Step {currentStep + 1} of {practice.steps.length}
                </CardTitle>
                {isCurrentStepDone && (
                  <span className="text-xp flex items-center gap-1 text-xs font-bold">
                    <Star className="size-3.5" aria-hidden="true" />+
                    {XP_BY_STEP_INDEX[currentStep]} XP
                  </span>
                )}
              </div>
              <StepProgress
                total={practice.steps.length}
                current={currentStep}
                completed={completed}
              />
            </CardHeader>
            <CardContent>
              {step.type === "multiple_choice" && (
                <MultipleChoiceStepView
                  key={currentStep}
                  step={step}
                  onCorrect={() => handleStepDone(currentStep)}
                />
              )}
              {step.type === "fill_blank" && (
                <FillBlankStepView
                  key={currentStep}
                  step={step}
                  onCorrect={() => handleStepDone(currentStep)}
                />
              )}
              {step.type === "reorder" && (
                <ReorderStepView
                  key={currentStep}
                  step={step}
                  onCorrect={() => handleStepDone(currentStep)}
                />
              )}
              {step.type === "free_text" && (
                <FreeTextStepView
                  key={currentStep}
                  step={step}
                  skillName={context.skill.name}
                  onCorrect={() => handleStepDone(currentStep)}
                />
              )}
              {step.type === "mini_dialogue" && (
                <MiniDialogueStepView
                  key={currentStep}
                  openingQuestion={step.openingQuestion}
                  skillName={context.skill.name}
                  jdText={context.jdText}
                  onComplete={() => handleStepDone(currentStep)}
                />
              )}

              {isCurrentStepDone && currentStep < practice.steps.length - 1 && (
                <Button
                  size="lg"
                  className="clay-press mt-4 h-12 w-full rounded-xl text-base font-extrabold"
                  onClick={handleAdvance}
                >
                  Continue
                  <ArrowRight className="size-5" aria-hidden="true" />
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {allDone && (
          <Button
            size="lg"
            className="clay-press h-12 rounded-xl text-base font-extrabold"
            onClick={handleGoToInterview}
          >
            <Sparkles className="size-5" aria-hidden="true" />
            Try a mock interview
            <ArrowRight className="size-5" aria-hidden="true" />
          </Button>
        )}
      </div>
    </PageShell>
  );
}
