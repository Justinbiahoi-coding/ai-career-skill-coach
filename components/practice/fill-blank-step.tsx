"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "cn";
import type { FillBlankStep as FillBlankStepData } from "@/lib/types";

/**
 * Graded client-side by loose string match — case/whitespace-insensitive, so
 * "join" and " Join " both count without needing the model to judge it.
 */

export interface FillBlankStepProps {
  step: FillBlankStepData;
  onCorrect: () => void;
}

function normalize(s: string): string {
  return s.trim().toLowerCase();
}

export function FillBlankStepView({ step, onCorrect }: FillBlankStepProps) {
  const [value, setValue] = useState("");
  const [checked, setChecked] = useState(false);

  const isCorrect = checked && normalize(value) === normalize(step.correctAnswer);
  const [before, after] = step.sentence.split("___");

  function handleCheck() {
    if (!value.trim()) return;
    setChecked(true);
    if (normalize(value) === normalize(step.correctAnswer)) onCorrect();
  }

  function handleRetry() {
    setValue("");
    setChecked(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="font-aeonik text-lg leading-snug font-bold text-carbon">
        {before}
        <span
          className={cn(
            "mx-1 inline-block min-w-24 rounded-[10px] border-b-2 border-dashed px-2 text-center",
            isCorrect ? "border-carbon bg-mint-pop" : "border-carbon"
          )}
        >
          {checked ? step.correctAnswer : value || "      "}
        </span>
        {after}
      </p>

      {!checked && (
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleCheck();
          }}
          placeholder="Type the missing word..."
          aria-label="Fill in the blank"
          className="h-12 rounded-full border-carbon font-aeonik text-base"
          autoFocus
        />
      )}

      {checked && (
        <p
          className={cn(
            "animate-pop flex items-start gap-2 rounded-[16px] border border-carbon px-4 py-3 font-aeonik text-sm leading-relaxed text-carbon",
            isCorrect ? "bg-mint-pop" : "bg-sunburst"
          )}
          aria-live="polite"
        >
          {isCorrect && <Check className="mt-0.5 size-4 shrink-0 text-carbon" aria-hidden="true" />}
          {step.explanation}
        </p>
      )}

      {!checked ? (
        <Button
          size="lg"
          className="h-12 self-start rounded-full border border-carbon bg-carbon font-aeonik font-extrabold text-paper-white hover:bg-carbon/85"
          disabled={!value.trim()}
          onClick={handleCheck}
        >
          Check
        </Button>
      ) : !isCorrect ? (
        <Button
          size="lg"
          variant="outline"
          className="h-12 self-start rounded-full border border-carbon bg-paper-white font-aeonik font-bold text-carbon hover:bg-soft-mist"
          onClick={handleRetry}
        >
          Try again
        </Button>
      ) : null}
    </div>
  );
}
