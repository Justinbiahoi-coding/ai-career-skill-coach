"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "cn";
import { MAX_INTERVIEW_QUESTIONS } from "@/lib/prompts";
import { loadExtractedSkills, loadSelectedGap, saveInterviewScore } from "@/lib/session-store";
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

  useEffect(() => {
    const skill = loadSelectedGap();
    const extracted = loadExtractedSkills();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setContext(skill && extracted ? { skill, jdText: extracted.jdText } : null);
    setCheckedStorage(true);
  }, []);

  useEffect(() => {
    if (!context || transcript.length > 0 || pendingQuestion) return;
    fetchNextQuestion([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context]);

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
        <p className="text-muted-foreground text-sm">
          Question {Math.min(questionNumber, MAX_INTERVIEW_QUESTIONS)} of {MAX_INTERVIEW_QUESTIONS}
        </p>
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
            <Input
              placeholder="Type your answer..."
              value={answer}
              maxLength={MAX_ANSWER_LENGTH}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmitAnswer();
              }}
            />
            <Button onClick={handleSubmitAnswer} disabled={loading || !answer.trim()}>
              {isLastQuestion ? "Submit final answer" : "Send"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
