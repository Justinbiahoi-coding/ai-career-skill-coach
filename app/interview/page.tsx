"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "cn";
import { MAX_INTERVIEW_QUESTIONS } from "@/lib/prompts";
import {
  loadExtractedSkills,
  loadSelectedGap,
  markSkillPracticed,
  saveInterviewScore,
} from "@/lib/session-store";
import {
  useSpeech,
  stripDoneKeyword,
  VOICE_DONE_KEYWORD,
  VOICE_INTRO_HINT,
} from "@/lib/use-speech";
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
  // Chế độ hội thoại: AI đọc xong -> tự bật mic -> nói xong tự gửi. Tắt được
  // để quay về thao tác tay khi phòng ồn hoặc nhận diện sai nhiều.
  const [autoConverse, setAutoConverse] = useState(true);

  // true nếu lượt nói vừa rồi kết thúc bằng từ khóa "I'm done" (tín hiệu rõ
  // ràng) thay vì chỉ im lặng (tín hiệu mơ hồ) — quyết định thời gian chờ
  // trước khi tự gửi ở effect bên dưới.
  const explicitDoneRef = useRef(false);
  const stopListeningRef = useRef<() => void>(() => {});

  // Text nhận diện được đổ thẳng vào ô trả lời để người dùng đọc lại/sửa
  // trước khi gửi — quan trọng vì phòng thi ồn và giọng Việt nói tiếng Anh
  // dễ bị nhận sai. Nếu chứa từ khóa "I'm done", cắt bỏ từ khóa và đánh dấu
  // đã kết thúc rõ ràng, tự dừng mic ngay.
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

  // Giữ bản mới nhất của hàm gửi để các effect bên dưới gọi được mà không
  // phải đưa nó vào dependency (tránh effect chạy lại mỗi lần render).
  const submitRef = useRef<() => void>(() => {});

  // Đọc to câu hỏi mới. Ở chế độ hội thoại, đọc xong thì tự bật mic luôn —
  // mic chỉ bật khi AI đã nói xong nên không thu lại chính giọng AI. Câu hỏi
  // đầu tiên được ghép thêm hướng dẫn về từ khóa "I'm done" (chỉ nói 1 lần).
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
    // autoConverse/recognitionSupported/transcript cố ý không nằm trong
    // deps: chỉ cần giá trị tại thời điểm câu hỏi mới xuất hiện, không cần
    // đọc lại câu hỏi khi người dùng bật/tắt chế độ giữa chừng.
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

    // Nói "I'm done" (tín hiệu rõ ràng) -> gần như gửi ngay. Chỉ dừng vì im
    // lặng (tín hiệu mơ hồ, có thể do tiếng ồn) -> chờ lâu hơn, cho cơ hội
    // Cancel.
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

  // Đồng bộ hàm gửi vào ref sau mỗi lần render (không đụng ref lúc render).
  useEffect(() => {
    submitRef.current = handleSubmitAnswer;
  });

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
      markSkillPracticed(context.skill.name);
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
        {voiceMode && autoConverse && recognitionSupported && (
          <p className="text-muted-foreground text-xs">
            Hands-free: the mic starts automatically after each question, and your answer sends
            when you stop speaking. Switch to Manual if the room is noisy.
          </p>
        )}
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
            {!recognitionSupported && (
              <p className="text-muted-foreground text-xs">
                Voice answering isn&apos;t supported in this browser — use Chrome or Edge for it, or
                just type your answer.
              </p>
            )}

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
