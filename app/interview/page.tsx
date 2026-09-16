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
  buildSilenceNudgeText,
  SILENCE_NUDGE_MS,
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
  // Refs cho các hàm từ useSpeech: cần gọi được từ trong handleTranscript
  // (định nghĩa trước khi useSpeech trả về chúng) và từ trong callback
  // setTimeout (tránh dùng closure cũ nếu identity của hàm đổi giữa chừng).
  const stopListeningRef = useRef<() => void>(() => {});
  const startListeningRef = useRef<() => void>(() => {});
  const speakRef = useRef<(text: string, onEnd?: () => void) => void>(() => {});

  // Đánh dấu lượt dừng mic hiện tại là do chính app chủ động dừng để nhắc im
  // lặng (không phải người dùng thật sự dừng) — effect tự gửi bên dưới cần
  // biết để KHÔNG coi đây là đã trả lời xong.
  const nudgeInProgressRef = useRef(false);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = null;
  }, []);

  // Đặt lại "đồng hồ im lặng": nếu không có hoạt động gì mới trong
  // SILENCE_NUDGE_MS, AI chủ động dừng mic, nhắc nhẹ bằng giọng nói, rồi mở
  // mic nghe tiếp — không tự gửi câu trả lời dở dang.
  const scheduleSilenceNudge = useCallback(() => {
    clearSilenceTimer();
    silenceTimerRef.current = setTimeout(() => {
      nudgeInProgressRef.current = true;
      stopListeningRef.current();
      speakRef.current(buildSilenceNudgeText(), () => startListeningRef.current());
    }, SILENCE_NUDGE_MS);
  }, [clearSilenceTimer]);

  // Text nhận diện được đổ thẳng vào ô trả lời để người dùng đọc lại/sửa
  // trước khi gửi — quan trọng vì phòng thi ồn và giọng Việt nói tiếng Anh
  // dễ bị nhận sai. Nếu chứa từ khóa "I'm done", cắt bỏ từ khóa và đánh dấu
  // đã kết thúc rõ ràng, tự dừng mic ngay. Có hoạt động thật (nói được gì
  // đó) thì đặt lại đồng hồ im lặng.
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

  // Mic bắt đầu nghe -> khởi động đồng hồ im lặng; mic dừng (vì bất kỳ lý do
  // gì) -> huỷ đồng hồ, không nhắc nhở khi không còn đang nghe.
  useEffect(() => {
    if (listening) {
      scheduleSilenceNudge();
    } else {
      clearSilenceTimer();
    }
    return () => clearSilenceTimer();
  }, [listening, scheduleSilenceNudge, clearSilenceTimer]);

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

    // Lần dừng này là do app tự dừng để nhắc im lặng, không phải người dùng
    // thật sự ngừng trả lời — bỏ qua, đừng tự gửi câu trả lời dở dang.
    if (stoppedListening && nudgeInProgressRef.current) {
      nudgeInProgressRef.current = false;
      return;
    }

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
      <PageShell step="interview">
        <div className="flex flex-col items-center gap-4 py-10 text-center">
          <MascotSays mood="thinking">
            No skill picked for this session yet. Let&apos;s start from the top.
          </MascotSays>
          <Button size="lg" className="clay-press rounded-xl font-bold" onClick={() => router.push("/")}>
            Back to start
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
  const shownNumber = Math.min(questionNumber, MAX_INTERVIEW_QUESTIONS);

  return (
    <PageShell step="interview">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Mock interview</h1>
            <Badge className="text-xs">{context.skill.name}</Badge>
          </div>

          <XpBar
            value={shownNumber}
            max={MAX_INTERVIEW_QUESTIONS}
            label="Interview progress"
            caption={`Question ${shownNumber} of ${MAX_INTERVIEW_QUESTIONS}`}
          />

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant={voiceMode ? "default" : "outline"}
              size="sm"
              className="h-11 rounded-full font-bold"
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
                className="h-11 rounded-full font-bold"
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

          {voiceMode && autoConverse && recognitionSupported && (
            <p className="text-muted-foreground rounded-xl bg-accent/40 px-3 py-2 text-xs leading-relaxed">
              The mic starts on its own after each question, and your answer sends when you stop
              speaking. Switch to Manual if the room is noisy.
            </p>
          )}
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
                  className="text-muted-foreground hover:text-foreground ml-1 inline-flex min-h-11 w-fit cursor-pointer items-center gap-1.5 text-xs font-semibold underline underline-offset-2"
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
                        // Tắt giọng đọc trước khi bật mic, tránh mic thu lại
                        // chính câu hỏi đang được đọc to.
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
                    className="text-primary min-h-11 cursor-pointer font-bold underline underline-offset-2"
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

              {!recognitionSupported && (
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Voice answering isn&apos;t supported in this browser — use Chrome or Edge for it,
                  or just type your answer.
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
