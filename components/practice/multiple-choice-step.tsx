"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "cn";
import type { MultipleChoiceStep as MultipleChoiceStepData } from "@/lib/types";

/**
 * Graded entirely client-side: the step's correctIndex is a fixed fact once
 * generated, so there's no reason to round-trip to Gemini (or spend quota)
 * to check a multiple-choice answer.
 */

export interface MultipleChoiceStepProps {
  step: MultipleChoiceStepData;
  onCorrect: () => void;
}

export function MultipleChoiceStepView({ step, onCorrect }: MultipleChoiceStepProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);

  const isCorrect = checked && selected === step.correctIndex;
  const isWrong = checked && selected !== null && selected !== step.correctIndex;

  function handleCheck() {
    if (selected === null) return;
    setChecked(true);
    if (selected === step.correctIndex) onCorrect();
  }

  function handleRetry() {
    setSelected(null);
    setChecked(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-lg font-bold leading-snug">{step.question}</p>

      <div role="radiogroup" aria-label={step.question} className="flex flex-col gap-2.5">
        {step.options.map((option, i) => {
          const isSelected = selected === i;
          const showAsCorrect = checked && i === step.correctIndex;
          const showAsWrong = checked && isSelected && i !== step.correctIndex;

          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={checked}
              onClick={() => setSelected(i)}
              className={cn(
                "flex min-h-14 items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left text-sm font-semibold transition-all",
                "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:cursor-default",
                !checked && isSelected && "border-primary bg-accent/50",
                !checked && !isSelected && "border-border bg-card hover:border-primary/40",
                showAsCorrect && "border-success bg-success-muted",
                showAsWrong && "border-destructive bg-destructive/10"
              )}
            >
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-extrabold",
                  !checked && isSelected && "border-primary bg-primary text-primary-foreground",
                  !checked && !isSelected && "border-border text-muted-foreground",
                  showAsCorrect && "border-success bg-success text-success-foreground",
                  showAsWrong && "border-destructive bg-destructive text-white"
                )}
              >
                {showAsCorrect ? (
                  <Check className="size-3.5" aria-hidden="true" />
                ) : showAsWrong ? (
                  <X className="size-3.5" aria-hidden="true" />
                ) : (
                  String.fromCharCode(65 + i)
                )}
              </span>
              {option}
            </button>
          );
        })}
      </div>

      {checked && (
        <p
          className={cn(
            "animate-pop rounded-xl px-4 py-3 text-sm leading-relaxed",
            isCorrect ? "bg-success-muted" : "bg-warning-muted"
          )}
          aria-live="polite"
        >
          {step.explanation}
        </p>
      )}

      {!checked ? (
        <Button
          size="lg"
          className="clay-press h-12 self-start rounded-xl font-extrabold"
          disabled={selected === null}
          onClick={handleCheck}
        >
          Check
        </Button>
      ) : isWrong ? (
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
