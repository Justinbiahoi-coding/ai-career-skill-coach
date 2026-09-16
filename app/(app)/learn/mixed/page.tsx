"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Loader2, Star, Trophy } from "lucide-react";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { StepProgress } from "@/components/practice/step-progress";
import { MultipleChoiceStepView } from "@/components/practice/multiple-choice-step";
import { FillBlankStepView } from "@/components/practice/fill-blank-step";
import { ReorderStepView } from "@/components/practice/reorder-step";
import { FreeTextStepView } from "@/components/practice/free-text-step";
import { MiniDialogueStepView } from "@/components/practice/mini-dialogue-step";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { addXp, loadExtractedSkills, loadSelectedGap, markCardCompletedForSkill } from "@/lib/session-store";
import type { MixedCardResult, PracticeStep } from "@/lib/types";

// Free text and mini_dialogue involve an AI judgment call, so they're worth
// more than the three locally-graded types — same ratio the original
// 5-fixed-step design used.
const XP_BY_TYPE: Record<PracticeStep["type"], number> = {
  multiple_choice: 10,
  fill_blank: 10,
  reorder: 10,
  free_text: 15,
  mini_dialogue: 15,
};

interface Context {
  skillName: string;
  jdText: string;
}

/**
 * The hardest, most comprehensive card: ~15 items spanning all 5 types in
 * whatever order the model returned them, rendered by branching on each
 * item's own `type`.
 */
export default function MixedCardPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null | undefined>(undefined);
  const [context, setContext] = useState<Context | null>(null);
  const [checkedStorage, setCheckedStorage] = useState(false);

  const [items, setItems] = useState<PracticeStep[] | null>(null);
  const [usedFallback, setUsedFallback] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState<boolean[]>([]);
  const [cardMarkedDone, setCardMarkedDone] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null));

    const selectedGap = loadSelectedGap();
    const extracted = loadExtractedSkills();
    const nextContext =
      selectedGap && extracted ? { skillName: selectedGap.skill.name, jdText: extracted.jdText } : null;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setContext(nextContext);
    setCheckedStorage(true);
  }, []);

  useEffect(() => {
    if (!context) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);

    fetch("/api/generate-practice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skillName: context.skillName, jdText: context.jdText, mode: "mixed" }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? "Request failed");
        }
        return res.json();
      })
      .then((data: MixedCardResult) => {
        if (cancelled) return;
        setItems(data.items);
        setUsedFallback(data.usedFallback);
        setCompleted(new Array(data.items.length).fill(false));
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Something went wrong");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [context]);

  const allDone = items ? completed.every(Boolean) && completed.length > 0 : false;

  useEffect(() => {
    if (allDone && context && !cardMarkedDone) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCardMarkedDone(true);
      markCardCompletedForSkill(context.skillName, "mixed");
    }
  }, [allDone, context, cardMarkedDone]);

  function handleCorrect(index: number, itemType: PracticeStep["type"]) {
    setCompleted((prev) => {
      if (prev[index]) return prev;
      const next = [...prev];
      next[index] = true;
      return next;
    });
    addXp(XP_BY_TYPE[itemType]);
  }

  function handleAdvance() {
    if (!items) return;
    if (currentIndex < items.length - 1) setCurrentIndex((i) => i + 1);
  }

  if (checkedStorage && !context) {
    return (
      <div className="flex min-h-screen flex-col bg-sky-wash">
        <LandingNavbar userEmail={userEmail} />
        <main className="mx-auto flex w-full max-w-[720px] flex-1 flex-col items-center justify-center gap-4 px-5 py-12 text-center">
          <p className="font-aeonik text-base font-medium text-carbon/80">
            No skill picked for this session yet.
          </p>
          <Button
            size="lg"
            className="h-12 rounded-full border border-carbon bg-carbon font-aeonik font-bold text-paper-white hover:bg-carbon/85"
            onClick={() => router.push("/gap")}
          >
            Back to skill breakdown
          </Button>
        </main>
      </div>
    );
  }

  if (!context) {
    return (
      <div className="flex min-h-screen flex-col bg-sky-wash">
        <LandingNavbar userEmail={userEmail} />
        <main className="mx-auto flex w-full max-w-[720px] flex-1 items-center justify-center px-5 py-16">
          <p className="font-aeonik text-sm font-medium text-carbon/60">Loading...</p>
        </main>
      </div>
    );
  }

  const step = items?.[currentIndex];
  const isCurrentDone = completed[currentIndex] ?? false;

  return (
    <div className="flex min-h-screen flex-col bg-sky-wash">
      <LandingNavbar userEmail={userEmail} />

      <main className="mx-auto flex w-full max-w-[720px] flex-1 flex-col gap-6 px-5 py-12 sm:px-8">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-lateral text-[clamp(26px,5vw,40px)] font-extrabold uppercase leading-[0.85] text-carbon">
            Mixed Drill
          </h1>
          <span className="rounded-full border border-carbon bg-electric-blue px-3 py-1 font-aeonik text-xs font-bold text-paper-white">
            {context.skillName}
          </span>
        </div>

        {loading && (
          <div className="flex items-center gap-2 py-8 font-aeonik text-sm font-medium text-carbon/60" aria-live="polite">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Building your mixed drill — this one takes a bit longer...
          </div>
        )}

        {error && (
          <p className="rounded-[16px] border border-carbon bg-ember px-3.5 py-2.5 font-aeonik text-sm font-bold text-paper-white">
            {error}
          </p>
        )}

        {usedFallback && (
          <p className="rounded-[16px] border border-carbon bg-sunburst px-3.5 py-2.5 font-aeonik text-xs font-bold text-carbon">
            The AI coach didn&apos;t respond, so this is offline sample content.
          </p>
        )}

        {items && step && !allDone && (
          <div className="flex flex-col gap-4 rounded-[30px] border border-carbon bg-paper-white p-6 sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <span className="font-aeonik text-base font-extrabold text-carbon">
                Item {currentIndex + 1} of {items.length}
              </span>
              {isCurrentDone && (
                <span className="flex items-center gap-1 font-aeonik text-xs font-bold text-carbon">
                  <Star className="size-3.5" aria-hidden="true" />+{XP_BY_TYPE[step.type]} XP
                </span>
              )}
            </div>
            <StepProgress total={items.length} current={currentIndex} completed={completed} />

            {step.type === "multiple_choice" && (
              <MultipleChoiceStepView
                key={currentIndex}
                step={step}
                onCorrect={() => handleCorrect(currentIndex, step.type)}
              />
            )}
            {step.type === "fill_blank" && (
              <FillBlankStepView
                key={currentIndex}
                step={step}
                onCorrect={() => handleCorrect(currentIndex, step.type)}
              />
            )}
            {step.type === "reorder" && (
              <ReorderStepView
                key={currentIndex}
                step={step}
                onCorrect={() => handleCorrect(currentIndex, step.type)}
              />
            )}
            {step.type === "free_text" && (
              <FreeTextStepView
                key={currentIndex}
                step={step}
                skillName={context.skillName}
                onCorrect={() => handleCorrect(currentIndex, step.type)}
              />
            )}
            {step.type === "mini_dialogue" && (
              <MiniDialogueStepView
                key={currentIndex}
                openingQuestion={step.openingQuestion}
                skillName={context.skillName}
                jdText={context.jdText}
                onComplete={() => handleCorrect(currentIndex, step.type)}
              />
            )}

            {isCurrentDone && currentIndex < items.length - 1 && (
              <Button
                size="lg"
                className="h-12 w-full rounded-full border border-carbon bg-carbon font-aeonik text-base font-extrabold text-paper-white hover:bg-carbon/85"
                onClick={handleAdvance}
              >
                Continue
                <ArrowRight className="size-5" aria-hidden="true" />
              </Button>
            )}
          </div>
        )}

        {allDone && (
          <div className="flex flex-col items-center gap-3 rounded-[30px] border border-carbon bg-mint-pop/30 py-10 text-center">
            <Trophy className="size-10 text-carbon" aria-hidden="true" />
            <p className="font-aeonik font-extrabold text-carbon">
              Mixed drill complete — all {items?.length} items done.
            </p>
          </div>
        )}

        <Button
          size="lg"
          variant="outline"
          className="h-12 rounded-full border border-carbon bg-paper-white font-aeonik font-bold text-carbon hover:bg-soft-mist"
          onClick={() => router.push("/learn")}
        >
          <ArrowLeft className="size-5" aria-hidden="true" />
          Back to Practice Room
        </Button>
      </main>
    </div>
  );
}
