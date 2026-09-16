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
      <p className="text-lg leading-snug font-bold">
        {before}
        <span
          className={cn(
            "mx-1 inline-block min-w-24 rounded-lg border-b-2 border-dashed px-2 text-center",
            isCorrect ? "border-success text-success" : "border-primary"
          )}
        >
          {checked ? step.correctAnswer : value || "      "}
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
          className="h-12 rounded-xl text-base"
          autoFocus
        />
      )}

      {checked && (
        <p
          className={cn(
            "animate-pop flex items-start gap-2 rounded-xl px-4 py-3 text-sm leading-relaxed",
            isCorrect ? "bg-success-muted" : "bg-warning-muted"
          )}
          aria-live="polite"
        >
          {isCorrect && <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />}
          {step.explanation}
        </p>
      )}

      {!checked ? (
        <Button
          size="lg"
          className="clay-press h-12 self-start rounded-xl font-extrabold"
          disabled={!value.trim()}
          onClick={handleCheck}
        >
          Check
        </Button>
      ) : !isCorrect ? (
        <Button
          size="lg"
          variant="outline"
          className="h-12 self-start rounded-xl font-bold"
          onClick={handleRetry}
        >
          Try again
        </Button>
      ) : null}
    </div>
  );
}
