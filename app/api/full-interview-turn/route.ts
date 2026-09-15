import { NextResponse } from "next/server";
import { getGeminiClient, DEFAULT_MODEL } from "@/lib/gemini";
import {
  FULL_INTERVIEW_TURN_SYSTEM_PROMPT,
  buildFullInterviewTurnPrompt,
  computeMaxFullInterviewQuestions,
} from "@/lib/prompts";
import { buildFallbackFullInterviewTurn } from "@/lib/fallback-data";
import { extractJsonBlock } from "@/lib/json-utils";
import type { FullInterviewTurnResult, InterviewMessage } from "@/lib/types";

const MAX_JD_LENGTH = 3000;
const MAX_SKILL_NAME_LENGTH = 200;
const MAX_SKILLS = 15;
const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_LENGTH = 30;

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

function isValidSkillNames(value: unknown): value is string[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_SKILLS) return false;
  return value.every((s) => typeof s === "string" && s.length > 0 && s.length <= MAX_SKILL_NAME_LENGTH);
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
  const jdText: unknown = body?.jdText;
  const practicedSkills: unknown = body?.practicedSkills;
  const history: unknown = body?.history ?? [];

  if (typeof jdText !== "string" || jdText.trim().length === 0) {
    return NextResponse.json({ error: "jdText is required" }, { status: 400 });
  }
  if (jdText.length > MAX_JD_LENGTH) {
    return NextResponse.json(
      { error: `jdText must be at most ${MAX_JD_LENGTH} characters` },
      { status: 400 }
    );
  }
  if (!isValidSkillNames(practicedSkills)) {
    return NextResponse.json({ error: "practicedSkills is required" }, { status: 400 });
  }
  if (!isValidHistory(history)) {
    return NextResponse.json({ error: "history is invalid" }, { status: 400 });
  }

  const questionNumber = Math.floor(history.length / 2) + 1;
  // Trần số câu được server tự tính từ số skill thật sự gửi lên, không tin
  // vào bất kỳ giá trị max nào client có thể gửi kèm.
  const maxQuestions = computeMaxFullInterviewQuestions(practicedSkills.length);

  try {
    const model = getGeminiClient().getGenerativeModel({
      model: DEFAULT_MODEL,
      systemInstruction: FULL_INTERVIEW_TURN_SYSTEM_PROMPT,
      generationConfig: { responseMimeType: "application/json" },
    });

    const generation = await model.generateContent(
      buildFullInterviewTurnPrompt(jdText, practicedSkills, history, questionNumber, maxQuestions)
    );
    const rawText = generation.response.text();

    const parsed: unknown = JSON.parse(extractJsonBlock(rawText));

    if (!isValidTurnShape(parsed)) {
      throw new Error("Model response did not match the expected schema");
    }

    const result: FullInterviewTurnResult = {
      question: parsed.question,
      isLast: parsed.isLast || questionNumber >= maxQuestions,
      usedFallback: false,
    };
    return NextResponse.json(result);
  } catch (error) {
    console.error("full-interview-turn failed, using fallback:", error);
    return NextResponse.json(
      buildFallbackFullInterviewTurn(questionNumber, maxQuestions, practicedSkills)
    );
  }
}
