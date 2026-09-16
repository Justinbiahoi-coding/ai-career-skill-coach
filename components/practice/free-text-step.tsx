"use client";

import { useRef, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "cn";
import type { FreeTextStep as FreeTextStepData, GradeStepResult } from "@/lib/types";

const MAX_ANSWER_LENGTH = 2000;
/** Passing threshold to unlock "Continue" without a retry — matches /result's 7/10 bar. */
const PASS_SCORE = 7;

export interface FreeTextStepProps {
  step: FreeTextStepData;
  skillName: string;
  /** Called once with a passing, non-fallback grade — the signal to award XP. */
  onCorrect: () => void;
}

export function FreeTextStepView({ step, skillName, onCorrect }: FreeTextStepProps) {
  const [answer, setAnswer] = useState("");
  const [grade, setGrade] = useState<GradeStepResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const awardedRef = useRef(false);

  const passed = grade ? grade.score >= PASS_SCORE : false;

  async function handleSubmit() {
    if (!answer.trim() || loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/grade-step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillName, prompt: step.prompt, answer }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Request failed");
      }
      const data: GradeStepResult = await res.json();
      setGrade(data);
      // Only ever fires once per step, even across retries, and only for a
      // real (non-fallback) passing grade — same rule /learn already used
      // for its single exercise before this multi-step version existed.
      if (!data.usedFallback && data.score >= PASS_SCORE && !awardedRef.current) {
        awardedRef.current = true;
        onCorrect();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function handleRetry() {
    setAnswer("");
    setGrade(null);
    setError(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="rounded-[16px] border border-carbon bg-sky-wash px-4 py-3 font-aeonik text-sm font-semibold leading-relaxed text-carbon">
        {step.prompt}
      </p>

      {!grade && (
        <>
          <Textarea
            placeholder="Write your answer here..."
            value={answer}
            maxLength={MAX_ANSWER_LENGTH}
            aria-label="Your answer"
            onChange={(e) => setAnswer(e.target.value)}
            className="min-h-[140px] rounded-[16px] border-carbon font-aeonik text-sm leading-relaxed"
            autoFocus
          />
          <div className="flex items-center justify-between gap-2">
            <span className="font-aeonik text-xs font-bold tabular-nums text-carbon/50">
              {answer.length}/{MAX_ANSWER_LENGTH}
            </span>
            <Button
              size="lg"
              className="h-11 rounded-full border border-carbon bg-carbon font-aeonik font-extrabold text-paper-white hover:bg-carbon/85"
              onClick={handleSubmit}
              disabled={loading || !answer.trim()}
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="size-4" aria-hidden="true" />
              )}
              {loading ? "Grading" : "Submit"}
            </Button>
          </div>
        </>
      )}

      {error && (
        <p className="rounded-[16px] border border-carbon bg-ember px-3.5 py-2.5 font-aeonik text-sm font-bold text-paper-white">
          {error}
        </p>
      )}

      {grade && (
        <div className="animate-pop flex flex-col gap-3" aria-live="polite">
          {grade.usedFallback && (
            <p className="rounded-[16px] border border-carbon bg-sunburst px-3.5 py-2.5 font-aeonik text-xs font-bold text-carbon">
              The AI grader didn&apos;t respond, so this is a placeholder score — no XP for it.
            </p>
          )}
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex size-14 shrink-0 flex-col items-center justify-center rounded-[16px] border border-carbon font-aeonik font-extrabold tabular-nums text-carbon",
                passed ? "bg-mint-pop" : "bg-sunburst"
              )}
            >
              <span className="text-lg leading-none">{grade.score}</span>
              <span className="text-[10px] leading-none opacity-70">/ 10</span>
            </div>
            <span className="font-aeonik font-extrabold text-carbon">
              {passed ? "Strong answer" : "Room to sharpen"}
            </span>
          </div>
          <p className="font-aeonik text-sm leading-relaxed text-carbon/80">{grade.feedback}</p>

          {!passed && (
            <Button
              size="lg"
              variant="outline"
              className="h-12 self-start rounded-full border border-carbon bg-paper-white font-aeonik font-bold text-carbon hover:bg-soft-mist"
              onClick={handleRetry}
            >
              Try again
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
