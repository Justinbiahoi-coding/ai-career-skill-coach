"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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
  speak: (text: string) => void;
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
    recognition.continuous = false;
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

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }, []);

  const stopSpeaking = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
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
