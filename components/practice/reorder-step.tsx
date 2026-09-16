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
      <p className="text-lg font-bold leading-snug">{step.instruction}</p>

      <div className="flex flex-col gap-2" aria-label="Your order">
        {chosen.length === 0 && (
          <p className="text-muted-foreground rounded-xl border-2 border-dashed border-border px-4 py-4 text-center text-sm">
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
                "flex min-h-14 items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left text-sm font-semibold transition-all",
                "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:cursor-default",
                !checked && "border-primary bg-accent/50",
                isRight && "border-success bg-success-muted",
                isWrongSpot && "border-destructive bg-destructive/10"
              )}
            >
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-extrabold",
                  !checked && "border-primary bg-primary text-primary-foreground",
                  isRight && "border-success bg-success text-success-foreground",
                  isWrongSpot && "border-destructive bg-destructive text-white"
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
          <span className="text-muted-foreground text-xs font-bold uppercase tracking-wide">
            Available
          </span>
          <div className="flex flex-wrap gap-2">
            {remaining.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => handlePick(item)}
                className="min-h-11 cursor-pointer rounded-xl border-2 border-border bg-card px-3.5 py-2 text-sm font-semibold transition-colors hover:border-primary/50 hover:bg-accent/40 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
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
          disabled={!isComplete}
          onClick={handleCheck}
        >
          Check order
        </Button>
      ) : !isCorrect ? (
        <Button
          size="lg"
          variant="outline"
          className="h-12 self-start rounded-xl font-bold"
          onClick={handleRetry}
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          Try again
        </Button>
      ) : null}
    </div>
  );
}
