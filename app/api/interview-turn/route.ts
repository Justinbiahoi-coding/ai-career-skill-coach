import { NextResponse } from "next/server";
import { generateWithFailover } from "@/lib/gemini";
import { INTERVIEW_TURN_SYSTEM_PROMPT, MAX_INTERVIEW_QUESTIONS, MAX_JD_LENGTH, buildInterviewTurnPrompt } from "@/lib/prompts";
import { buildFallbackInterviewTurn } from "@/lib/fallback-data";
import { extractJsonBlock } from "@/lib/json-utils";
import type { InterviewMessage, InterviewTurnResult } from "@/lib/types";

const MAX_SKILL_NAME_LENGTH = 200;
const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_LENGTH = 20;

function isValidHistory(value: unknown): value is InterviewMessage[] {
  if (!Array.isArray(value) || value.length > MAX_HISTORY_LENGTH) return false;
  return value.every((m): m is InterviewMessage => {
    if (typeof m !== "object" || m === null) return false;
    const msg = m as { role?: unknown; text?: unknown };
    return (
      (msg.role === "assistant" || msg.role === "user") &&
      typeof msg.text === "string" &&
      msg.text.length > 0 &&
      msg.text.length <= MAX_MESSAGE_LENGTH
    );
  });
}

function isValidTurnShape(value: unknown): value is { question: string; isLast: boolean } {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { question: unknown }).question === "string" &&
    typeof (value as { isLast: unknown }).isLast === "boolean"
  );
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const skillName: unknown = body?.skillName;
  const jdText: unknown = body?.jdText;
  const history: unknown = body?.history ?? [];

  if (typeof skillName !== "string" || skillName.trim().length === 0) {
    return NextResponse.json({ error: "skillName is required" }, { status: 400 });
  }
  if (skillName.length > MAX_SKILL_NAME_LENGTH) {
    return NextResponse.json(
      { error: `skillName must be at most ${MAX_SKILL_NAME_LENGTH} characters` },
      { status: 400 }
    );
  }
  if (typeof jdText !== "string" || jdText.trim().length === 0) {
    return NextResponse.json({ error: "jdText is required" }, { status: 400 });
  }
  if (jdText.length > MAX_JD_LENGTH) {
    return NextResponse.json(
      { error: `jdText must be at most ${MAX_JD_LENGTH} characters` },
      { status: 400 }
    );
  }
  if (!isValidHistory(history)) {
    return NextResponse.json({ error: "history is invalid" }, { status: 400 });
  }

  const questionNumber = Math.floor(history.length / 2) + 1;

  try {
    const rawText = await generateWithFailover(
      buildInterviewTurnPrompt(skillName, jdText, history, questionNumber, MAX_INTERVIEW_QUESTIONS),
      { systemInstruction: INTERVIEW_TURN_SYSTEM_PROMPT, generationConfig: { responseMimeType: "application/json" } }
    );

    const parsed: unknown = JSON.parse(extractJsonBlock(rawText));

    if (!isValidTurnShape(parsed)) {
      throw new Error("Model response did not match the expected schema");
    }

    const result: InterviewTurnResult = {
      question: parsed.question,
      // Chốt cứng isLast ở phía server khi đã tới câu cuối, không hoàn toàn
      // tin vào model — tránh interview chạy quá số câu quy định.
      isLast: parsed.isLast || questionNumber >= MAX_INTERVIEW_QUESTIONS,
      usedFallback: false,
    };
    return NextResponse.json(result);
  } catch (error) {
    console.error("interview-turn failed, using fallback:", error);
    return NextResponse.json(buildFallbackInterviewTurn(questionNumber, MAX_INTERVIEW_QUESTIONS));
  }
}
