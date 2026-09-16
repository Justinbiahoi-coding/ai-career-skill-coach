"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Loader2, Star, Trophy } from "lucide-react";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { StepProgress } from "@/components/practice/step-progress";
import { MultipleChoiceStepView } from "@/components/practice/multiple-choice-step";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { addXp, loadExtractedSkills, loadSelectedGap, markCardCompletedForSkill } from "@/lib/session-store";
import type { DrillCardResult, MultipleChoiceStep } from "@/lib/types";

const XP_PER_ITEM = 10;

interface Context {
  skillName: string;
  jdText: string;
}

/**
 * One of the 5 single-type drill cards. Shared shell logic (fetch, progress
 * dots, completion) lives here rather than a generic component, since each
 * card renders a different *Step view with different props — trying to
 * genericize that across 5 unrelated prop shapes would cost more than it
 * saves for exactly 5 call sites.
 */
export default function MultipleChoiceCardPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null | undefined>(undefined);
  const [context, setContext] = useState<Context | null>(null);
  const [checkedStorage, setCheckedStorage] = useState(false);

  const [items, setItems] = useState<MultipleChoiceStep[] | null>(null);
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
      body: JSON.stringify({
        skillName: context.skillName,
        jdText: context.jdText,
        mode: "multiple_choice",
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? "Request failed");
        }
        return res.json();
      })
      .then((data: DrillCardResult) => {
        if (cancelled) return;
        setItems(data.items as MultipleChoiceStep[]);
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
      markCardCompletedForSkill(context.skillName, "multiple_choice");
    }
  }, [allDone, context, cardMarkedDone]);

  function handleCorrect(index: number) {
    setCompleted((prev) => {
      if (prev[index]) return prev;
      const next = [...prev];
      next[index] = true;
      return next;
    });
    addXp(XP_PER_ITEM);
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

  const currentItem = items?.[currentIndex];
  const isCurrentDone = completed[currentIndex] ?? false;

  return (
    <div className="flex min-h-screen flex-col bg-sky-wash">
      <LandingNavbar userEmail={userEmail} />

      <main className="mx-auto flex w-full max-w-[720px] flex-1 flex-col gap-6 px-5 py-12 sm:px-8">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-lateral text-[clamp(26px,5vw,40px)] font-extrabold uppercase leading-[0.85] text-carbon">
            Multiple Choice
          </h1>
          <span className="rounded-full border border-carbon bg-electric-blue px-3 py-1 font-aeonik text-xs font-bold text-paper-white">
            {context.skillName}
          </span>
        </div>

        {loading && (
          <div className="flex items-center gap-2 py-8 font-aeonik text-sm font-medium text-carbon/60" aria-live="polite">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Building your questions...
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

        {items && currentItem && !allDone && (
          <div className="flex flex-col gap-4 rounded-[30px] border border-carbon bg-paper-white p-6 sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <span className="font-aeonik text-base font-extrabold text-carbon">
                Question {currentIndex + 1} of {items.length}
              </span>
              {isCurrentDone && (
                <span className="flex items-center gap-1 font-aeonik text-xs font-bold text-carbon">
                  <Star className="size-3.5" aria-hidden="true" />+{XP_PER_ITEM} XP
                </span>
              )}
            </div>
            <StepProgress total={items.length} current={currentIndex} completed={completed} />

            <MultipleChoiceStepView
              key={currentIndex}
              step={currentItem}
              onCorrect={() => handleCorrect(currentIndex)}
            />

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
              Card complete — all {items?.length} questions done.
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
