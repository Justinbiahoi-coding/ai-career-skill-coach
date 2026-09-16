"use client";

import { useMemo, useState } from "react";
import { Check, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "cn";
import type { ReorderStep as ReorderStepData } from "@/lib/types";

/**
 * Tap-to-order rather than drag-and-drop: taps register cleanly on mobile
 * (where a hackathon judge is as likely to look as a laptop), while drag
 * targets are easy to fumble on a touchscreen and would cost far more time
 * to get right under tonight's deadline than the interaction is worth.
 */

export interface ReorderStepProps {
  step: ReorderStepData;
  onCorrect: () => void;
}

// Fisher-Yates, seeded once per step via useMemo — reshuffling on every
// render would make the tiles jump around as the user interacts with them.
function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function ReorderStepView({ step, onCorrect }: ReorderStepProps) {
  const shuffled = useMemo(() => shuffle(step.correctOrder), [step]);
  const [chosen, setChosen] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);

  const remaining = shuffled.filter((item) => !chosen.includes(item));
  const isComplete = chosen.length === step.correctOrder.length;
  const isCorrect = checked && chosen.every((item, i) => item === step.correctOrder[i]);

  function handlePick(item: string) {
    if (checked) return;
    setChosen((prev) => [...prev, item]);
  }

  function handleUndo(index: number) {
    if (checked) return;
    setChosen((prev) => prev.filter((_, i) => i !== index));
  }

  function handleCheck() {
    if (!isComplete) return;
    setChecked(true);
    if (chosen.every((item, i) => item === step.correctOrder[i])) onCorrect();
  }

  function handleRetry() {
    setChosen([]);
    setChecked(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="font-aeonik text-lg leading-snug font-bold text-carbon">{step.instruction}</p>

      <div className="flex flex-col gap-2" aria-label="Your order">
        {chosen.length === 0 && (
          <p className="rounded-[16px] border border-dashed border-carbon/40 px-4 py-4 text-center font-aeonik text-sm text-carbon/60">
            Tap the steps below in order
          </p>
        )}
        {chosen.map((item, i) => {
          const isRight = checked && item === step.correctOrder[i];
          const isWrongSpot = checked && item !== step.correctOrder[i];
          return (
            <button
              key={item}
              type="button"
              disabled={checked}
              onClick={() => handleUndo(i)}
              className={cn(
                "flex min-h-14 items-center gap-3 rounded-[16px] border border-carbon px-4 py-3 text-left font-aeonik text-sm font-semibold text-carbon transition-all",
                "focus-visible:ring-3 focus-visible:ring-carbon/30 focus-visible:outline-none disabled:cursor-default",
                !checked && "bg-sky-wash",
                isRight && "bg-mint-pop",
                isWrongSpot && "bg-ember text-paper-white"
              )}
            >
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full border border-carbon font-aeonik text-xs font-extrabold",
                  !checked && "bg-carbon text-paper-white",
                  isRight && "bg-carbon text-paper-white",
                  isWrongSpot && "bg-paper-white text-carbon"
                )}
              >
                {checked ? (
                  isRight ? (
                    <Check className="size-3.5" aria-hidden="true" />
                  ) : (
                    <X className="size-3.5" aria-hidden="true" />
                  )
                ) : (
                  i + 1
                )}
              </span>
              {item}
            </button>
          );
        })}
      </div>

      {remaining.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="font-aeonik text-xs font-bold tracking-[0.02em] text-carbon/50 uppercase">
            Available
          </span>
          <div className="flex flex-wrap gap-2">
            {remaining.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => handlePick(item)}
                className="min-h-11 cursor-pointer rounded-full border border-carbon bg-paper-white px-3.5 py-2 font-aeonik text-sm font-semibold text-carbon transition-colors hover:bg-soft-mist focus-visible:ring-3 focus-visible:ring-carbon/30 focus-visible:outline-none"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

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
          disabled={!isComplete}
          onClick={handleCheck}
        >
          Check order
        </Button>
      ) : !isCorrect ? (
        <Button
          size="lg"
          variant="outline"
          className="h-12 self-start rounded-full border border-carbon bg-paper-white font-aeonik font-bold text-carbon hover:bg-soft-mist"
          onClick={handleRetry}
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          Try again
        </Button>
      ) : null}
    </div>
  );
}
