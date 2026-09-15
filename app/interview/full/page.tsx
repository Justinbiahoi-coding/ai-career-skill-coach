"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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

  const handleTranscript = useCallback((text: string) => {
    const { cleaned, isDone } = stripDoneKeyword(text);
    if (cleaned) {
      setAnswer((prev) => (prev ? `${prev} ${cleaned}` : cleaned));
    }
    if (isDone) {
      explicitDoneRef.current = true;
      stopListeningRef.current();
    }
  }, []);

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
  }, [stopListening]);

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
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 px-4 py-16 text-center">
        <p className="text-muted-foreground text-sm">
          You haven&apos;t practiced every skill yet — the full interview unlocks once you have.
        </p>
        <Button onClick={() => router.push("/gap")}>Back to skills</Button>
      </div>
    );
  }

  if (!context) {
    return (
      <div className="mx-auto flex w-full max-w-2xl px-4 py-16 text-center text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  const questionNumber = Math.floor(transcript.length / 2) + 1;
  const maxQuestions = computeMaxFullInterviewQuestions(context.practicedSkills.length);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10">
      <div className="flex flex-col gap-2 text-center sm:text-left">
        <div className="flex items-center justify-center gap-2 sm:justify-start">
          <h1 className="text-2xl font-semibold tracking-tight">🎯 Full Interview</h1>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          {context.practicedSkills.map((name) => (
            <Badge key={name} variant="secondary">
              {name}
            </Badge>
          ))}
        </div>
        <div className="flex items-center justify-center gap-3 sm:justify-start">
          <p className="text-muted-foreground text-sm">
            Question {Math.min(questionNumber, maxQuestions)} of ~{maxQuestions}
          </p>
          <Button
            type="button"
            variant={voiceMode ? "default" : "outline"}
            size="xs"
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
            {voiceMode ? "🔊 Voice on" : "🔇 Voice off"}
          </Button>
          {voiceMode && recognitionSupported && (
            <Button
              type="button"
              variant={autoConverse ? "default" : "outline"}
              size="xs"
              onClick={() => {
                const next = !autoConverse;
                setAutoConverse(next);
                if (!next) stopListening();
              }}
            >
              {autoConverse ? "💬 Hands-free" : "✋ Manual"}
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {transcript.map((message, i) => (
          <div
            key={i}
            className={cn(
              "max-w-[85%] rounded-lg px-4 py-2 text-sm",
              message.role === "assistant"
                ? "self-start bg-muted"
                : "self-end bg-primary text-primary-foreground"
            )}
          >
            {message.text}
          </div>
        ))}

        {pendingQuestion && (
          <div className="flex flex-col gap-2">
            <div className="self-start max-w-[85%] rounded-lg bg-muted px-4 py-2 text-sm">
              {pendingQuestion}
            </div>
            {voiceMode && (
              <button
                type="button"
                onClick={() => (speaking ? stopSpeaking() : speak(pendingQuestion))}
                className="text-muted-foreground self-start text-xs underline"
              >
                {speaking ? "🔊 Speaking… (tap to stop)" : "🔊 Replay question"}
              </button>
            )}
            {usedFallback && (
              <p className="text-sm text-amber-600">
                The AI interviewer failed, so this is an offline sample question instead.
              </p>
            )}
          </div>
        )}

        {(loading || finishing) && (
          <p className="text-muted-foreground text-sm">
            {finishing ? "Scoring your interview..." : "Interviewer is thinking..."}
          </p>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      {pendingQuestion && !finishing && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your answer</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex gap-2">
              <Input
                placeholder={listening ? "Listening..." : "Speak or type your answer..."}
                value={answer}
                maxLength={MAX_ANSWER_LENGTH}
                onChange={(e) => {
                  cancelAutoSend();
                  setAnswer(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmitAnswer();
                }}
                className="flex-1"
              />
              {recognitionSupported && (
                <Button
                  type="button"
                  variant={listening ? "default" : "outline"}
                  size="icon"
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
                >
                  {listening ? "⏹" : "🎤"}
                </Button>
              )}
            </div>

            {listening && (
              <p className="text-muted-foreground text-xs">
                Listening… pausing briefly is fine. Say &quot;{VOICE_DONE_KEYWORD}&quot; or tap ⏹
                when finished.
              </p>
            )}
            {autoSendPending && (
              <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-xs">
                <span>Sending in a moment…</span>
                <button
                  type="button"
                  onClick={cancelAutoSend}
                  className="text-primary font-medium underline"
                >
                  Cancel
                </button>
              </div>
            )}
            {speechError && <p className="text-sm text-amber-600">{speechError}</p>}

            <Button
              onClick={() => {
                cancelAutoSend();
                handleSubmitAnswer();
              }}
              disabled={loading || !answer.trim()}
            >
              {isLastQuestion ? "Submit final answer" : "Send"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
