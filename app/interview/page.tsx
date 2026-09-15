"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "cn";
import { MAX_INTERVIEW_QUESTIONS } from "@/lib/prompts";
import { loadExtractedSkills, loadSelectedGap, saveInterviewScore } from "@/lib/session-store";
import { useSpeech } from "@/lib/use-speech";
import type { InterviewMessage, InterviewTurnResult, Skill } from "@/lib/types";

const MAX_ANSWER_LENGTH = 2000;

interface InterviewContext {
  skill: Skill;
  jdText: string;
}

export default function InterviewPage() {
  const router = useRouter();
  const [context, setContext] = useState<InterviewContext | null>(null);
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

  // Text nhận diện được đổ thẳng vào ô trả lời để người dùng đọc lại/sửa
  // trước khi gửi — quan trọng vì phòng thi ồn và giọng Việt nói tiếng Anh
  // dễ bị nhận sai.
  const handleTranscript = useCallback((text: string) => {
    setAnswer((prev) => (prev ? `${prev} ${text}` : text));
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
    const selectedGap = loadSelectedGap();
    const extracted = loadExtractedSkills();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setContext(
      selectedGap && extracted ? { skill: selectedGap.skill, jdText: extracted.jdText } : null
    );
    setCheckedStorage(true);
  }, []);

  useEffect(() => {
    if (!context || transcript.length > 0 || pendingQuestion) return;
    fetchNextQuestion([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context]);

  // Đọc to câu hỏi mới khi đang ở chế độ voice.
  useEffect(() => {
    if (voiceMode && pendingQuestion) speak(pendingQuestion);
  }, [pendingQuestion, voiceMode, speak]);

  async function fetchNextQuestion(history: InterviewMessage[]) {
    if (!context) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/interview-turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillName: context.skill.name, jdText: context.jdText, history }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Request failed");
      }

      const data: InterviewTurnResult = await res.json();
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
      const res = await fetch("/api/interview-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skillName: context.skill.name,
          jdText: context.jdText,
          history: fullHistory,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Request failed");
      }

      const score = await res.json();
      saveInterviewScore(score);
      router.push("/result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setFinishing(false);
    }
  }

  async function handleSubmitAnswer() {
    if (!pendingQuestion || !answer.trim()) return;

    // Dừng mic và giọng đọc trước khi chuyển lượt, tránh thu nhầm câu hỏi
    // tiếp theo đang được đọc to vào phần trả lời.
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

  if (checkedStorage && !context) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 px-4 py-16 text-center">
        <p className="text-muted-foreground text-sm">
          No skill selected for this session. Start from the beginning.
        </p>
        <Button onClick={() => router.push("/")}>Back to start</Button>
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

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10">
      <div className="flex flex-col gap-2 text-center sm:text-left">
        <div className="flex items-center justify-center gap-2 sm:justify-start">
          <h1 className="text-2xl font-semibold tracking-tight">4. Mock interview</h1>
          <Badge>{context.skill.name}</Badge>
        </div>
        <div className="flex items-center justify-center gap-3 sm:justify-start">
          <p className="text-muted-foreground text-sm">
            Question {Math.min(questionNumber, MAX_INTERVIEW_QUESTIONS)} of {MAX_INTERVIEW_QUESTIONS}
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
                onChange={(e) => setAnswer(e.target.value)}
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
                      // Tắt giọng đọc trước khi bật mic, tránh mic thu lại
                      // chính câu hỏi đang được đọc to.
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
                Listening… speak your answer, then tap ⏹ to stop. You can edit the text before
                sending.
              </p>
            )}
            {speechError && <p className="text-sm text-amber-600">{speechError}</p>}
            {!recognitionSupported && (
              <p className="text-muted-foreground text-xs">
                Voice answering isn&apos;t supported in this browser — use Chrome or Edge for it, or
                just type your answer.
              </p>
            )}

            <Button onClick={handleSubmitAnswer} disabled={loading || !answer.trim()}>
              {isLastQuestion ? "Submit final answer" : "Send"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
