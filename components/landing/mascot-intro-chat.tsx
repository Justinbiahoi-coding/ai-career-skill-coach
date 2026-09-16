"use client";

import { useEffect, useState } from "react";

/**
 * Lines the mascot "says" while introducing the product on the landing
 * hero — cycles continuously, one character at a time, then holds before
 * erasing and moving to the next line. Kept short and plain (no fabricated
 * stats) since this is marketing copy a real visitor reads closely.
 */
const INTRO_LINES = [
  "Hi, I'm the Joblingo mascot!",
  "I read real job postings and find your skill gaps.",
  "Then I coach you through short practice drills.",
  "And I run a hands-free voice mock interview with you.",
  "Ready to see how ready you really are?",
];

const TYPE_SPEED_MS = 38;
const ERASE_SPEED_MS = 18;
const HOLD_AFTER_TYPE_MS = 1800;
const HOLD_AFTER_ERASE_MS = 300;

/**
 * A static, non-animated fallback for prefers-reduced-motion: shows the
 * first line in full rather than nothing, since the chat bubble is the
 * hero's main piece of copy, not decoration.
 */
function useTypewriterCycle(lines: string[], enabled: boolean): string {
  const [lineIndex, setLineIndex] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<"typing" | "holding" | "erasing">("typing");

  useEffect(() => {
    if (!enabled) return;
    const currentLine = lines[lineIndex];
    let timeoutId: ReturnType<typeof setTimeout>;

    if (phase === "typing") {
      if (text.length < currentLine.length) {
        timeoutId = setTimeout(() => setText(currentLine.slice(0, text.length + 1)), TYPE_SPEED_MS);
      } else {
        timeoutId = setTimeout(() => setPhase("holding"), HOLD_AFTER_TYPE_MS);
      }
    } else if (phase === "holding") {
      timeoutId = setTimeout(() => setPhase("erasing"), 0);
    } else {
      if (text.length > 0) {
        timeoutId = setTimeout(() => setText(text.slice(0, -1)), ERASE_SPEED_MS);
      } else {
        timeoutId = setTimeout(() => {
          setLineIndex((i) => (i + 1) % lines.length);
          setPhase("typing");
        }, HOLD_AFTER_ERASE_MS);
      }
    }

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, phase, lineIndex, enabled]);

  return text;
}

export function MascotIntroChat() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReducedMotion(query.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }, []);

  const typed = useTypewriterCycle(INTRO_LINES, !reducedMotion);
  const displayText = reducedMotion ? INTRO_LINES[0] : typed;

  return (
    <div
      className="relative flex min-h-[92px] w-full flex-col justify-center rounded-[20px] border border-carbon bg-paper-white px-4 py-3"
      role="status"
      aria-live="polite"
    >
      <span className="font-aeonik text-sm font-semibold leading-relaxed text-carbon">
        {displayText}
        {!reducedMotion && (
          <span className="ml-0.5 inline-block h-4 w-[2px] -translate-y-0.5 animate-pulse bg-carbon align-middle" />
        )}
      </span>
      {/* Speech-bubble notch pointing left, toward the mascot */}
      <span
        aria-hidden="true"
        className="absolute top-6 -left-[7px] size-3 rotate-45 border-b border-l border-carbon bg-paper-white"
      />
    </div>
  );
}
