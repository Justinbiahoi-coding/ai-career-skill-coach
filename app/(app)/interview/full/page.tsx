"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Hand,
  Loader2,
  MessageSquare,
  Mic,
  Send,
  Square,
  Trophy,
  Volume2,
  VolumeX,
} from "lucide-react";
import { MascotSays } from "@/components/game/mascot-says";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { cn } from "cn";
import { computeMaxFullInterviewQuestions } from "@/lib/prompts";
import { loadExtractedSkills, saveFullInterviewScore } from "@/lib/session-store";
import {
  useSpeech,
  stripDoneKeyword,
  buildSilenceNudgeText,
  SILENCE_NUDGE_MS,
  VOICE_DONE_KEYWORD,
  VOICE_INTRO_HINT,
} from "@/lib/use-speech";
import type { FullInterviewTurnResult, InterviewMessage } from "@/lib/types";

const MAX_ANSWER_LENGTH = 2000;

interface FullInterviewContext {
  jdText: string;
  practicedSkills: string[];
}

export default function FullInterviewPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null | undefined>(undefined);
  const [context, setContext] = useState<FullInterviewContext | null>(null);
  const [checkedStorage, setCheckedStorage] = useState(false);

  const [transcript, setTranscript] = useState<InterviewMessage[]>([]);
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const [isLastQuestion, setIsLastQuestion] = useState(false);
  const [usedFallback, setUsedFallback] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [finishing, setFinishing] = useState(false);
  const [voiceMode, setVoiceMode] = useState(true);
  const [autoConverse, setAutoConverse] = useState(true);

  const explicitDoneRef = useRef(false);
  const stopListeningRef = useRef<() => void>(() => {});
  const startListeningRef = useRef<() => void>(() => {});
  const speakRef = useRef<(text: string, onEnd?: () => void) => void>(() => {});
  const nudgeInProgressRef = useRef(false);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = null;
  }, []);

  const scheduleSilenceNudge = useCallback(() => {
    clearSilenceTimer();
    silenceTimerRef.current = setTimeout(() => {
      nudgeInProgressRef.current = true;
      stopListeningRef.current();
      speakRef.current(buildSilenceNudgeText(), () => startListeningRef.current());
    }, SILENCE_NUDGE_MS);
  }, [clearSilenceTimer]);

  const handleTranscript = useCallback(
    (text: string) => {
      const { cleaned, isDone } = stripDoneKeyword(text);
      if (cleaned) {
        setAnswer((prev) => (prev ? `${prev} ${cleaned}` : cleaned));
      }
      if (isDone) {
        explicitDoneRef.current = true;
        clearSilenceTimer();
        stopListeningRef.current();
      } else if (cleaned) {
        scheduleSilenceNudge();
      }
    },
    [clearSilenceTimer, scheduleSilenceNudge]
  );

  const {
    recognitionSupported,
    listening,
    speaking,
    speechError,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  } = useSpeech(handleTranscript);

  useEffect(() => {
    stopListeningRef.current = stopListening;
    startListeningRef.current = startListening;
    speakRef.current = speak;
  }, [stopListening, startListening, speak]);

  useEffect(() => {
    if (listening) {
      scheduleSilenceNudge();
    } else {
      clearSilenceTimer();
    }
    return () => clearSilenceTimer();
  }, [listening, scheduleSilenceNudge, clearSilenceTimer]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null));

    const extracted = loadExtractedSkills();

    // Both entry points — /gap's "Take the full interview" button and Mock
    // Test's "Start anyway"/"Take the full interview" — write this key right
    // before pushing here, after they've each already decided (or let the
    // student decide) whether enough practice has happened. This page never
    // re-checks that decision; it only needs the list of skills to interview
    // on and the JD to ground questions in.
    //
    // Deliberately NOT cleared after reading: this effect can run twice in
    // one mount (React Strict Mode in dev, and any future re-render that
    // re-triggers it) — a one-shot removeItem here means the second run
    // reads null and wipes out the context the first run just set. The key
    // is safely overwritten the next time either entry point is used, so
    // leaving it stale between visits costs nothing.
    const practicedRaw = sessionStorage.getItem("acsc:mockTestPracticedSkills");
    let context: FullInterviewContext | null = null;

    if (extracted && practicedRaw) {
      try {
        const practicedSkills = JSON.parse(practicedRaw) as string[];
        context = { jdText: extracted.jdText, practicedSkills };
      } catch {
        context = null;
      }
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setContext(context);
    setCheckedStorage(true);
  }, []);

  useEffect(() => {
    if (!context || transcript.length > 0 || pendingQuestion) return;
    fetchNextQuestion([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context]);

  const submitRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (!voiceMode || !pendingQuestion) return;
    const isFirstTurn = transcript.length === 0;
    const textToSpeak = isFirstTurn ? `${VOICE_INTRO_HINT} ${pendingQuestion}` : pendingQuestion;
    speak(textToSpeak, () => {
      if (autoConverse && recognitionSupported) {
        explicitDoneRef.current = false;
        startListening();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingQuestion, voiceMode, speak]);

  // Mic dừng (hết hẳn, không phải tạm nghỉ nhờ continuous=true) -> đếm 1.5s
  // rồi mới tự gửi, cho người dùng cơ hội bấm Cancel nếu bị dừng/nghe nhầm
  // ngoài ý muốn (vd: tiếng ồn xung quanh).
  const wasListeningRef = useRef(false);
  const [autoSendPending, setAutoSendPending] = useState(false);
  const autoSendTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelAutoSend = useCallback(() => {
    if (autoSendTimerRef.current) clearTimeout(autoSendTimerRef.current);
    autoSendTimerRef.current = null;
    setAutoSendPending(false);
  }, []);

  useEffect(() => {
    const stoppedListening = wasListeningRef.current && !listening;
    wasListeningRef.current = listening;

    if (stoppedListening && nudgeInProgressRef.current) {
      nudgeInProgressRef.current = false;
      return;
    }

    if (!stoppedListening || !autoConverse || !voiceMode) return;
    if (!pendingQuestion || loading || finishing || !answer.trim()) return;

    const wasExplicit = explicitDoneRef.current;
    explicitDoneRef.current = false;
    const delay = wasExplicit ? 400 : 1500;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAutoSendPending(true);
    autoSendTimerRef.current = setTimeout(() => {
      setAutoSendPending(false);
      submitRef.current();
    }, delay);

    return () => {
      if (autoSendTimerRef.current) clearTimeout(autoSendTimerRef.current);
    };
  }, [listening, autoConverse, voiceMode, pendingQuestion, loading, finishing, answer]);

  async function fetchNextQuestion(history: InterviewMessage[]) {
    if (!context) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/full-interview-turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jdText: context.jdText,
          practicedSkills: context.practicedSkills,
          history,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Request failed");
      }

      const data: FullInterviewTurnResult = await res.json();
      setPendingQuestion(data.question);
      setIsLastQuestion(data.isLast);
      setUsedFallback(data.usedFallback);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function finishInterview(fullHistory: InterviewMessage[]) {
    if (!context) return;
    setFinishing(true);
    setError(null);

    try {
      const res = await fetch("/api/full-interview-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jdText: context.jdText,
          practicedSkills: context.practicedSkills,
          history: fullHistory,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Request failed");
      }

      const score = await res.json();
      saveFullInterviewScore(score);
      router.push("/result/full");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setFinishing(false);
    }
  }

  async function handleSubmitAnswer() {
    if (!pendingQuestion || !answer.trim()) return;

    stopListening();
    stopSpeaking();

    const fullHistory: InterviewMessage[] = [
      ...transcript,
      { role: "assistant", text: pendingQuestion },
      { role: "user", text: answer },
    ];

    setTranscript(fullHistory);
    setPendingQuestion(null);
    setAnswer("");

    if (isLastQuestion) {
      await finishInterview(fullHistory);
    } else {
      await fetchNextQuestion(fullHistory);
    }
  }

  useEffect(() => {
    submitRef.current = handleSubmitAnswer;
  });

  if (checkedStorage && !context) {
    return (
      <div className="flex min-h-screen flex-col bg-sky-wash">
        <LandingNavbar userEmail={userEmail} />
        <main className="mx-auto flex w-full max-w-[720px] flex-1 flex-col items-center justify-center gap-4 px-5 py-12 text-center">
          <p className="font-aeonik text-base font-medium text-carbon/80">
            Practice every skill first — then the full interview opens up.
          </p>
          <Button
            size="lg"
            className="h-12 rounded-full border border-carbon bg-carbon font-aeonik font-bold text-paper-white hover:bg-carbon/85"
            onClick={() => router.push("/gap")}
          >
            Back to skills
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

  const questionNumber = Math.floor(transcript.length / 2) + 1;
  const maxQuestions = computeMaxFullInterviewQuestions(context.practicedSkills.length);
  const shownNumber = Math.min(questionNumber, maxQuestions);

  return (
    <div className="flex min-h-screen flex-col bg-sky-wash">
      <LandingNavbar userEmail={userEmail} />

      <main className="mx-auto flex w-full max-w-[720px] flex-1 flex-col gap-5 px-5 py-12 sm:px-8">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Trophy className="size-6 text-carbon" aria-hidden="true" />
            <h1 className="font-lateral text-[clamp(26px,5vw,40px)] font-extrabold uppercase leading-[0.85] text-carbon">
              Full Interview
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {context.practicedSkills.map((name) => (
              <span
                key={name}
                className="rounded-full border border-carbon bg-soft-mist px-2.5 py-0.5 font-aeonik text-[11px] font-bold text-carbon"
              >
                {name}
              </span>
            ))}
          </div>

          <div className="flex flex-col gap-1.5 rounded-[20px] border border-carbon bg-paper-white p-4">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-aeonik text-sm font-bold text-carbon">Interview progress</span>
              <span className="font-aeonik text-xs font-extrabold tabular-nums text-carbon/60">
                Question {shownNumber} of ~{maxQuestions}
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full border border-carbon bg-soft-mist">
              <div
                className="h-full rounded-full bg-mint-pop transition-[width] duration-500 ease-out"
                style={{ width: `${(shownNumber / maxQuestions) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const next = !voiceMode;
                setVoiceMode(next);
                if (!next) {
                  stopSpeaking();
                  stopListening();
                } else if (pendingQuestion) {
                  speak(pendingQuestion);
                }
              }}
              className={cn(
                "flex h-11 items-center gap-2 rounded-full border border-carbon px-4 font-aeonik text-sm font-bold text-carbon transition-colors",
                voiceMode ? "bg-electric-blue text-paper-white" : "bg-paper-white hover:bg-soft-mist"
              )}
            >
              {voiceMode ? (
                <Volume2 className="size-4" aria-hidden="true" />
              ) : (
                <VolumeX className="size-4" aria-hidden="true" />
              )}
              {voiceMode ? "Voice on" : "Voice off"}
            </button>

            {voiceMode && recognitionSupported && (
              <button
                type="button"
                onClick={() => {
                  const next = !autoConverse;
                  setAutoConverse(next);
                  if (!next) stopListening();
                }}
                className={cn(
                  "flex h-11 items-center gap-2 rounded-full border border-carbon px-4 font-aeonik text-sm font-bold text-carbon transition-colors",
                  autoConverse ? "bg-electric-blue text-paper-white" : "bg-paper-white hover:bg-soft-mist"
                )}
              >
                {autoConverse ? (
                  <MessageSquare className="size-4" aria-hidden="true" />
                ) : (
                  <Hand className="size-4" aria-hidden="true" />
                )}
                {autoConverse ? "Hands-free" : "Manual"}
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {transcript.map((message, i) => (
            <div
              key={i}
              className={cn(
                "max-w-[85%] rounded-[16px] border border-carbon px-4 py-2.5 font-aeonik text-sm leading-relaxed",
                message.role === "assistant"
                  ? "self-start bg-paper-white text-carbon"
                  : "self-end bg-carbon text-paper-white"
              )}
            >
              {message.text}
            </div>
          ))}

          {pendingQuestion && (
            <div className="flex flex-col gap-2">
              <MascotSays mood="thinking" compact>
                {pendingQuestion}
              </MascotSays>
              {voiceMode && (
                <button
                  type="button"
                  onClick={() => (speaking ? stopSpeaking() : speak(pendingQuestion))}
                  className="ml-1 inline-flex min-h-11 w-fit cursor-pointer items-center gap-1.5 font-aeonik text-xs font-bold text-carbon/60 underline underline-offset-2 hover:text-carbon"
                >
                  <Volume2 className="size-3.5" aria-hidden="true" />
                  {speaking ? "Speaking — tap to stop" : "Replay question"}
                </button>
              )}
              {usedFallback && (
                <p className="rounded-[16px] border border-carbon bg-sunburst px-3.5 py-2.5 font-aeonik text-xs font-bold text-carbon">
                  The AI interviewer didn&apos;t respond, so this is an offline sample question.
                </p>
              )}
            </div>
          )}

          {(loading || finishing) && (
            <p
              className="flex items-center gap-2 font-aeonik text-sm font-medium text-carbon/60"
              aria-live="polite"
            >
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              {finishing ? "Scoring your interview..." : "Interviewer is thinking..."}
            </p>
          )}

          {error && (
            <p className="rounded-[16px] border border-carbon bg-ember px-3.5 py-2.5 font-aeonik text-sm font-bold text-paper-white">
              {error}
            </p>
          )}
        </div>

        {pendingQuestion && !finishing && (
          <div className="flex flex-col gap-4 rounded-[30px] border border-carbon bg-paper-white p-6 sm:p-7">
            <span className="font-aeonik text-base font-extrabold text-carbon">Your answer</span>

            <div className="flex gap-2">
              <Input
                placeholder={listening ? "Listening..." : "Speak or type your answer..."}
                value={answer}
                maxLength={MAX_ANSWER_LENGTH}
                aria-label="Your answer"
                onChange={(e) => {
                  cancelAutoSend();
                  setAnswer(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmitAnswer();
                }}
                className="h-11 flex-1 rounded-full border-carbon font-aeonik"
              />
              {recognitionSupported && (
                <button
                  type="button"
                  aria-label={listening ? "Stop recording" : "Answer with your voice"}
                  onClick={() => {
                    if (listening) {
                      stopListening();
                    } else {
                      cancelAutoSend();
                      explicitDoneRef.current = false;
                      stopSpeaking();
                      startListening();
                    }
                  }}
                  className={cn(
                    "flex size-11 shrink-0 items-center justify-center rounded-full border border-carbon transition-colors",
                    listening ? "animate-pulse bg-ember text-paper-white" : "bg-paper-white text-carbon hover:bg-soft-mist"
                  )}
                >
                  {listening ? (
                    <Square className="size-4" aria-hidden="true" />
                  ) : (
                    <Mic className="size-4" aria-hidden="true" />
                  )}
                </button>
              )}
            </div>

            {listening && (
              <p className="font-aeonik text-xs font-bold text-carbon" aria-live="polite">
                Listening — pausing briefly is fine. Say &quot;{VOICE_DONE_KEYWORD}&quot; or tap
                stop when you&apos;re finished.
              </p>
            )}

            {autoSendPending && (
              <div className="flex items-center justify-between gap-2 rounded-[16px] border border-carbon bg-sky-wash px-3 py-2 font-aeonik text-xs font-bold text-carbon">
                <span>Sending in a moment...</span>
                <button
                  type="button"
                  onClick={cancelAutoSend}
                  className="min-h-11 cursor-pointer font-extrabold underline underline-offset-2"
                >
                  Cancel
                </button>
              </div>
            )}

            {speechError && (
              <p className="rounded-[16px] border border-carbon bg-sunburst px-3.5 py-2.5 font-aeonik text-xs font-bold text-carbon">
                {speechError}
              </p>
            )}

            <Button
              size="lg"
              className="h-12 rounded-full border border-carbon bg-carbon font-aeonik text-base font-extrabold text-paper-white hover:bg-carbon/85"
              onClick={() => {
                cancelAutoSend();
                handleSubmitAnswer();
              }}
              disabled={loading || !answer.trim()}
            >
              <Send className="size-5" aria-hidden="true" />
              {isLastQuestion ? "Submit final answer" : "Send"}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
