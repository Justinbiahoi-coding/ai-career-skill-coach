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
      <p className="font-aeonik text-lg leading-snug font-bold text-carbon">{step.question}</p>

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
                "flex min-h-14 items-center gap-3 rounded-[16px] border border-carbon px-4 py-3 text-left font-aeonik text-sm font-semibold text-carbon transition-all",
                "focus-visible:ring-3 focus-visible:ring-carbon/30 focus-visible:outline-none disabled:cursor-default",
                !checked && isSelected && "bg-sky-wash",
                !checked && !isSelected && "bg-paper-white hover:bg-soft-mist",
                showAsCorrect && "bg-mint-pop",
                showAsWrong && "bg-ember text-paper-white"
              )}
            >
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full border border-carbon font-aeonik text-xs font-extrabold",
                  !checked && isSelected && "bg-carbon text-paper-white",
                  !checked && !isSelected && "bg-paper-white text-carbon",
                  showAsCorrect && "bg-carbon text-paper-white",
                  showAsWrong && "bg-paper-white text-carbon"
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
            "animate-pop rounded-[16px] border border-carbon px-4 py-3 font-aeonik text-sm leading-relaxed text-carbon",
            isCorrect ? "bg-mint-pop" : "bg-sunburst"
          )}
          aria-live="polite"
        >
          {step.explanation}
        </p>
      )}

      {!checked ? (
        <Button
          size="lg"
          className="h-12 self-start rounded-full border border-carbon bg-carbon font-aeonik font-extrabold text-paper-white hover:bg-carbon/85"
          disabled={selected === null}
          onClick={handleCheck}
        >
          Check
        </Button>
      ) : isWrong ? (
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
