"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Câu "khóa" để người dùng báo hiệu rõ ràng đã trả lời xong, thay vì để AI
// đoán qua khoảng lặng (dễ nhầm lúc họ chỉ tạm ngừng để suy nghĩ). Giống
// "over" trong bộ đàm — nói ra là biết chắc chắn, không cần chờ/đoán.
const DONE_KEYWORD_REGEX = /\bi\s*'?\s*m\s+done\b|\bi\s+am\s+done\b/i;

export const VOICE_DONE_KEYWORD = "I'm done";

export const VOICE_INTRO_HINT =
  'Quick tip: say "I\'m done" out loud when you finish each answer, so I know right away instead of waiting.';

// Cắt cụm từ khóa ra khỏi text (không đưa vào nội dung câu trả lời thật),
// đồng thời báo có phát hiện từ khóa hay không.
export function stripDoneKeyword(text: string): { cleaned: string; isDone: boolean } {
  const match = text.match(DONE_KEYWORD_REGEX);
  if (!match || match.index === undefined) return { cleaned: text.trim(), isDone: false };
  const cleaned = text
    .slice(0, match.index)
    .trim()
    .replace(/[.,!?;:]+$/, "")
    .trim();
  return { cleaned, isDone: true };
}

// Web Speech API chưa có trong lib.dom mặc định của TypeScript nên phải tự
// khai báo phần tối thiểu mình dùng. Chỉ Chrome/Edge hỗ trợ tốt phần nhận
// diện giọng nói (webkit-prefixed); Safari/Firefox có thể không có.
interface SpeechRecognitionAlternativeLike {
  transcript: string;
}
interface SpeechRecognitionResultLike {
  readonly length: number;
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternativeLike;
}
interface SpeechRecognitionResultListLike {
  readonly length: number;
  [index: number]: SpeechRecognitionResultLike;
}
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: SpeechRecognitionResultListLike;
}
interface SpeechRecognitionErrorEventLike {
  error: string;
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export interface UseSpeechResult {
  /** Trình duyệt có hỗ trợ nhận diện giọng nói không (Chrome/Edge: có). */
  recognitionSupported: boolean;
  /** Đang nghe mic hay không. */
  listening: boolean;
  /** Đang đọc to câu hỏi hay không. */
  speaking: boolean;
  /** Lỗi mic gần nhất (vd: từ chối quyền, không nghe thấy gì). */
  speechError: string | null;
  startListening: () => void;
  stopListening: () => void;
  /** Đọc to `text`; `onEnd` chạy khi đọc xong (hoặc ngay nếu không đọc được). */
  speak: (text: string, onEnd?: () => void) => void;
  stopSpeaking: () => void;
}

/**
 * Bọc Web Speech API của trình duyệt: nghe (speech-to-text) và đọc
 * (text-to-speech). Chạy hoàn toàn phía client, KHÔNG tốn thêm lệnh gọi AI
 * nào — phần nhận diện/đọc do chính trình duyệt lo.
 *
 * @param onTranscript nhận text đã nhận diện xong (chỉ gọi khi có kết quả cuối)
 */
export function useSpeech(onTranscript: (text: string) => void): UseSpeechResult {
  const [recognitionSupported, setRecognitionSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Giữ callback trong ref để không phải dựng lại recognition mỗi lần render.
  const onTranscriptRef = useRef(onTranscript);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRecognitionSupported(true);

    const recognition = new Ctor();
    recognition.lang = "en-US";
    // continuous=true: một khoảng lặng ngắn (ngừng để nghỉ/suy nghĩ) không
    // bị coi là "đã nói xong" và tự dừng — chỉ dừng khi người dùng bấm dừng
    // hoặc trình duyệt tự timeout sau im lặng khá dài.
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      let text = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result.isFinal && result.length > 0) {
          text += result[0].transcript;
        }
      }
      if (text.trim()) onTranscriptRef.current(text.trim());
    };

    recognition.onerror = (event) => {
      setSpeechError(
        event.error === "not-allowed"
          ? "Microphone access was blocked. Allow it in your browser, or type your answer instead."
          : event.error === "no-speech"
            ? "Didn't catch that. Try again, or type your answer instead."
            : `Microphone error (${event.error}). You can type your answer instead.`
      );
      setListening(false);
    };

    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;

    return () => {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      try {
        recognition.stop();
      } catch {
        // stop() throws nếu chưa start — bỏ qua, không ảnh hưởng gì.
      }
    };
  }, []);

  const startListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition || listening) return;
    setSpeechError(null);
    try {
      recognition.start();
      setListening(true);
    } catch {
      // start() throws nếu đang chạy sẵn — coi như đã đang nghe.
      setListening(true);
    }
  }, [listening]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      onEnd?.();
      return;
    }
    const synth = window.speechSynthesis;
    synth.cancel();
    if (pollRef.current) clearInterval(pollRef.current);

    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = null;
      utteranceRef.current = null;
      setSpeaking(false);
      onEnd?.();
    };

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.onend = finish;
    utterance.onerror = finish;
    // Chrome thu gom rác utterance trước khi onend kịp chạy nếu không còn
    // tham chiếu nào — giữ lại ở ref để sự kiện không bị mất.
    utteranceRef.current = utterance;

    setSpeaking(true);
    synth.speak(utterance);

    // onend của Chrome vẫn có thể không chạy (đã gặp thật khi test: trình
    // duyệt báo speaking=false nhưng sự kiện im lặng). Thăm dò định kỳ làm
    // nguồn sự thật, nếu không thì chế độ hands-free sẽ treo vĩnh viễn.
    const startedAt = Date.now();
    pollRef.current = setInterval(() => {
      const idle = !synth.speaking && !synth.pending;
      // Cho 1 giây đầu để synthesis kịp khởi động trước khi coi là đã xong.
      if (idle && Date.now() - startedAt > 1000) finish();
    }, 200);
  }, []);

  const stopSpeaking = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = null;
    utteranceRef.current = null;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  // Dọn interval thăm dò khi rời trang.
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  return {
    recognitionSupported,
    listening,
    speaking,
    speechError,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  };
}
