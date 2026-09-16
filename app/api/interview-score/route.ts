import { NextResponse } from "next/server";
import { generateWithFailover } from "@/lib/gemini";
import { INTERVIEW_SCORE_SYSTEM_PROMPT, MAX_JD_LENGTH, buildInterviewScorePrompt } from "@/lib/prompts";
import { FALLBACK_INTERVIEW_SCORE } from "@/lib/fallback-data";
import { extractJsonBlock } from "@/lib/json-utils";
import type { InterviewMessage, InterviewScoreResult } from "@/lib/types";

const MAX_SKILL_NAME_LENGTH = 200;
const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_LENGTH = 20;

function isValidHistory(value: unknown): value is InterviewMessage[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_HISTORY_LENGTH) {
    return false;
  }
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

function isValidScoreShape(value: unknown): value is {
  clarity: number;
  relevance: number;
  confidence: number;
  overallFeedback: string;
} {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.clarity === "number" &&
    typeof v.relevance === "number" &&
    typeof v.confidence === "number" &&
    typeof v.overallFeedback === "string"
  );
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const skillName: unknown = body?.skillName;
  const jdText: unknown = body?.jdText;
  const history: unknown = body?.history;

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
    return NextResponse.json({ error: "history is required and must be non-empty" }, { status: 400 });
  }

  try {
    const rawText = await generateWithFailover(
      buildInterviewScorePrompt(skillName, jdText, history),
      { systemInstruction: INTERVIEW_SCORE_SYSTEM_PROMPT, generationConfig: { responseMimeType: "application/json" } }
    );

    const parsed: unknown = JSON.parse(extractJsonBlock(rawText));

    if (!isValidScoreShape(parsed)) {
      throw new Error("Model response did not match the expected schema");
    }

    const result: InterviewScoreResult = {
      clarity: parsed.clarity,
      relevance: parsed.relevance,
      confidence: parsed.confidence,
      overallFeedback: parsed.overallFeedback,
      usedFallback: false,
    };
    return NextResponse.json(result);
  } catch (error) {
    console.error("interview-score failed, using fallback:", error);
    return NextResponse.json(FALLBACK_INTERVIEW_SCORE);
  }
}
