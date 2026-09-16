"use client";

import { useRef, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { Mascot } from "@/components/mascot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "cn";
import type { DialogueTurn } from "@/lib/types";

const MAX_MESSAGE_LENGTH = 2000;

export interface MiniDialogueStepProps {
  openingQuestion: string;
  skillName: string;
  jdText: string;
  /** Called once the exchange ends — a short dialogue has no pass/fail score, just completion. */
  onComplete: () => void;
}

export function MiniDialogueStepView({
  openingQuestion,
  skillName,
  jdText,
  onComplete,
}: MiniDialogueStepProps) {
  const [history, setHistory] = useState<DialogueTurn[]>([
    { role: "assistant", text: openingQuestion },
  ]);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLast, setIsLast] = useState(false);
  const completedRef = useRef(false);

  async function handleSend() {
    if (!answer.trim() || loading || isLast) return;
    const nextHistory: DialogueTurn[] = [...history, { role: "user", text: answer }];
    setHistory(nextHistory);
    setAnswer("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/dialogue-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillName, jdText, history: nextHistory }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Request failed");
      }
      const data: { reply: string; isLast: boolean; usedFallback: boolean } = await res.json();
      setHistory((prev) => [...prev, { role: "assistant", text: data.reply }]);
      if (data.isLast) {
        setIsLast(true);
        if (!completedRef.current) {
          completedRef.current = true;
          onComplete();
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      // Roll back the optimistic user turn so a failed send can be retried
      // instead of leaving a dangling message the model never saw.
      setHistory(history);
      setAnswer(nextHistory[nextHistory.length - 1].text);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        {history.map((turn, i) => (
          <div
            key={i}
            className={cn(
              "flex items-start gap-2.5",
              turn.role === "user" && "flex-row-reverse"
            )}
          >
            {turn.role === "assistant" && (
              <Mascot mood="thinking" size="sm" className="mt-0.5 shrink-0" decorative />
            )}
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                turn.role === "assistant"
                  ? "border border-border bg-card"
                  : "bg-primary text-primary-foreground"
              )}
            >
              {turn.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2.5">
            <Mascot mood="thinking" size="sm" className="shrink-0" decorative />
            <span className="text-muted-foreground flex items-center gap-2 text-sm">
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Thinking...
            </span>
          </div>
        )}
      </div>

      {error && (
        <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
          {error}
        </p>
      )}

      {isLast ? (
        <p className="rounded-xl bg-success-muted px-4 py-3 text-sm font-semibold text-success-foreground">
          Exchange complete — nice work.
        </p>
      ) : (
        <div className="flex gap-2">
          <Input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            maxLength={MAX_MESSAGE_LENGTH}
            placeholder="Type your answer..."
            aria-label="Your answer"
            disabled={loading}
            className="h-11 flex-1 rounded-xl"
          />
          <Button
            type="button"
            size="icon"
            className="size-11 shrink-0 rounded-xl"
            onClick={handleSend}
            disabled={loading || !answer.trim()}
            aria-label="Send"
          >
            <Send className="size-4" aria-hidden="true" />
          </Button>
        </div>
      )}
    </div>
  );
}
