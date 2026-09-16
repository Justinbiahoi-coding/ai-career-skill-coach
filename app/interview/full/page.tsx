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
import { PageShell } from "@/components/game/page-shell";
import { XpBar } from "@/components/game/xp-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "cn";
import { computeMaxFullInterviewQuestions } from "@/lib/prompts";
import {
  loadExtractedSkills,
  loadPracticedSkills,
  saveFullInterviewScore,
} from "@/lib/session-store";
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
    const extracted = loadExtractedSkills();
    const practicedSkills = loadPracticedSkills();
    const allDone =
      extracted && practicedSkills.length > 0 &&
      extracted.skills.every((s) => practicedSkills.includes(s.name));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setContext(allDone ? { jdText: extracted.jdText, practicedSkills } : null);
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
      <PageShell step="interview">
        <div className="flex flex-col items-center gap-4 py-10 text-center">
          <MascotSays mood="thinking">
            Practice every skill first — then the full interview opens up.
          </MascotSays>
          <Button
            size="lg"
            className="clay-press rounded-xl font-bold"
            onClick={() => router.push("/gap")}
          >
            Back to skills
          </Button>
        </div>
      </PageShell>
    );
  }

  if (!context) {
    return (
      <PageShell step="interview">
        <div className="text-muted-foreground py-16 text-center text-sm">Loading...</div>
      </PageShell>
    );
  }

  const questionNumber = Math.floor(transcript.length / 2) + 1;
  const maxQuestions = computeMaxFullInterviewQuestions(context.practicedSkills.length);
  const shownNumber = Math.min(questionNumber, maxQuestions);

  return (
    <PageShell step="interview">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Trophy className="size-6 text-success" aria-hidden="true" />
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Full interview</h1>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {context.practicedSkills.map((name) => (
              <Badge key={name} variant="secondary" className="text-[11px]">
                {name}
              </Badge>
            ))}
          </div>

          <XpBar
            value={shownNumber}
            max={maxQuestions}
            label="Interview progress"
            caption={`Question ${shownNumber} of ~${maxQuestions}`}
            tone="success"
          />

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant={voiceMode ? "default" : "outline"}
              size="sm"
              className="rounded-full font-bold"
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
            >
              {voiceMode ? (
                <Volume2 className="size-4" aria-hidden="true" />
              ) : (
                <VolumeX className="size-4" aria-hidden="true" />
              )}
              {voiceMode ? "Voice on" : "Voice off"}
            </Button>

            {voiceMode && recognitionSupported && (
              <Button
                type="button"
                variant={autoConverse ? "default" : "outline"}
                size="sm"
                className="rounded-full font-bold"
                onClick={() => {
                  const next = !autoConverse;
                  setAutoConverse(next);
                  if (!next) stopListening();
                }}
              >
                {autoConverse ? (
                  <MessageSquare className="size-4" aria-hidden="true" />
                ) : (
                  <Hand className="size-4" aria-hidden="true" />
                )}
                {autoConverse ? "Hands-free" : "Manual"}
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {transcript.map((message, i) => (
            <div
              key={i}
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                message.role === "assistant"
                  ? "self-start border border-border bg-card"
                  : "self-end bg-primary text-primary-foreground"
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
                  className="text-muted-foreground hover:text-foreground ml-1 inline-flex min-h-9 w-fit cursor-pointer items-center gap-1.5 text-xs font-semibold underline underline-offset-2"
                >
                  <Volume2 className="size-3.5" aria-hidden="true" />
                  {speaking ? "Speaking — tap to stop" : "Replay question"}
                </button>
              )}
              {usedFallback && (
                <p className="rounded-xl bg-warning-muted px-3 py-2 text-xs font-semibold text-warning-foreground">
                  The AI interviewer didn&apos;t respond, so this is an offline sample question.
                </p>
              )}
            </div>
          )}

          {(loading || finishing) && (
            <p
              className="text-muted-foreground flex items-center gap-2 text-sm font-medium"
              aria-live="polite"
            >
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              {finishing ? "Scoring your interview..." : "Interviewer is thinking..."}
            </p>
          )}

          {error && (
            <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
              {error}
            </p>
          )}
        </div>

        {pendingQuestion && !finishing && (
          <Card className="clay-press">
            <CardHeader>
              <CardTitle className="text-base">Your answer</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
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
                  className="h-11 flex-1 rounded-xl"
                />
                {recognitionSupported && (
                  <Button
                    type="button"
                    variant={listening ? "default" : "outline"}
                    size="icon"
                    aria-label={listening ? "Stop recording" : "Answer with your voice"}
                    className={cn("size-11 rounded-xl", listening && "animate-pulse")}
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
                  >
                    {listening ? (
                      <Square className="size-4" aria-hidden="true" />
                    ) : (
                      <Mic className="size-4" aria-hidden="true" />
                    )}
                  </Button>
                )}
              </div>

              {listening && (
                <p className="text-primary text-xs font-semibold" aria-live="polite">
                  Listening — pausing briefly is fine. Say &quot;{VOICE_DONE_KEYWORD}&quot; or tap
                  stop when you&apos;re finished.
                </p>
              )}

              {autoSendPending && (
                <div className="flex items-center justify-between gap-2 rounded-xl bg-accent/60 px-3 py-2 text-xs font-semibold">
                  <span>Sending in a moment...</span>
                  <button
                    type="button"
                    onClick={cancelAutoSend}
                    className="text-primary min-h-9 cursor-pointer font-bold underline underline-offset-2"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {speechError && (
                <p className="rounded-xl bg-warning-muted px-3 py-2 text-xs font-semibold text-warning-foreground">
                  {speechError}
                </p>
              )}

              <Button
                size="lg"
                className="clay-press h-12 rounded-xl text-base font-extrabold"
                onClick={() => {
                  cancelAutoSend();
                  handleSubmitAnswer();
                }}
                disabled={loading || !answer.trim()}
              >
                <Send className="size-5" aria-hidden="true" />
                {isLastQuestion ? "Submit final answer" : "Send"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </PageShell>
  );
}
