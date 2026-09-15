import { NextResponse } from "next/server";
import { getGeminiClient, DEFAULT_MODEL } from "@/lib/gemini";
import { FULL_INTERVIEW_SCORE_SYSTEM_PROMPT, MAX_JD_LENGTH, buildFullInterviewScorePrompt } from "@/lib/prompts";
import { FALLBACK_FULL_INTERVIEW_SCORE } from "@/lib/fallback-data";
import { extractJsonBlock } from "@/lib/json-utils";
import type { FullInterviewScoreResult, InterviewMessage } from "@/lib/types";

const MAX_SKILL_NAME_LENGTH = 200;
const MAX_SKILLS = 15;
const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_LENGTH = 30;

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

function isValidSkillNames(value: unknown): value is string[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_SKILLS) return false;
  return value.every((s) => typeof s === "string" && s.length > 0 && s.length <= MAX_SKILL_NAME_LENGTH);
}

function isValidScoreShape(value: unknown): value is {
  overallReadiness: number;
  strengths: string;
  gaps: string;
  overallFeedback: string;
} {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.overallReadiness === "number" &&
    typeof v.strengths === "string" &&
    typeof v.gaps === "string" &&
    typeof v.overallFeedback === "string"
  );
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const jdText: unknown = body?.jdText;
  const practicedSkills: unknown = body?.practicedSkills;
  const history: unknown = body?.history;

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
    return NextResponse.json({ error: "history is required and must be non-empty" }, { status: 400 });
  }

  try {
    const model = getGeminiClient().getGenerativeModel({
      model: DEFAULT_MODEL,
      systemInstruction: FULL_INTERVIEW_SCORE_SYSTEM_PROMPT,
      generationConfig: { responseMimeType: "application/json" },
    });

    const generation = await model.generateContent(
      buildFullInterviewScorePrompt(jdText, practicedSkills, history)
    );
    const rawText = generation.response.text();

    const parsed: unknown = JSON.parse(extractJsonBlock(rawText));

    if (!isValidScoreShape(parsed)) {
      throw new Error("Model response did not match the expected schema");
    }

    const result: FullInterviewScoreResult = {
      overallReadiness: parsed.overallReadiness,
      strengths: parsed.strengths,
      gaps: parsed.gaps,
      overallFeedback: parsed.overallFeedback,
      usedFallback: false,
    };
    return NextResponse.json(result);
  } catch (error) {
    console.error("full-interview-score failed, using fallback:", error);
    return NextResponse.json(FALLBACK_FULL_INTERVIEW_SCORE);
  }
}
