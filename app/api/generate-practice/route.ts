import { NextResponse } from "next/server";
import { getGeminiClient, DEFAULT_MODEL } from "@/lib/gemini";
import {
  GENERATE_PRACTICE_SYSTEM_PROMPT,
  MAX_JD_LENGTH,
  buildGeneratePracticePrompt,
} from "@/lib/prompts";
import { buildFallbackPractice } from "@/lib/fallback-data";
import { extractJsonBlock } from "@/lib/json-utils";
import type { GeneratePracticeResult, PracticeStep } from "@/lib/types";

const MAX_SKILL_NAME_LENGTH = 200;
const EXPECTED_STEP_TYPES = [
  "multiple_choice",
  "fill_blank",
  "reorder",
  "free_text",
  "mini_dialogue",
] as const;

// Each check below only inspects the fields that step type actually has —
// deliberately loose rather than a full schema validator, since the goal is
// to catch a malformed Gemini response before it reaches the client, not to
// police every string length.
function isValidStep(value: unknown, expectedType: string): value is PracticeStep {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  if (v.type !== expectedType) return false;

  switch (expectedType) {
    case "multiple_choice":
      return (
        typeof v.question === "string" &&
        Array.isArray(v.options) &&
        v.options.length === 4 &&
        v.options.every((o) => typeof o === "string") &&
        typeof v.correctIndex === "number" &&
        v.correctIndex >= 0 &&
        v.correctIndex < 4 &&
        typeof v.explanation === "string"
      );
    case "fill_blank":
      return (
        typeof v.sentence === "string" &&
        typeof v.correctAnswer === "string" &&
        typeof v.explanation === "string"
      );
    case "reorder":
      return (
        typeof v.instruction === "string" &&
        Array.isArray(v.correctOrder) &&
        v.correctOrder.length >= 3 &&
        v.correctOrder.every((s) => typeof s === "string") &&
        typeof v.explanation === "string"
      );
    case "free_text":
      return typeof v.prompt === "string";
    case "mini_dialogue":
      return typeof v.openingQuestion === "string";
    default:
      return false;
  }
}

function isValidPracticeShape(
  value: unknown
): value is { lessonText: string; steps: PracticeStep[] } {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  if (typeof v.lessonText !== "string") return false;
  if (!Array.isArray(v.steps) || v.steps.length !== EXPECTED_STEP_TYPES.length) return false;
  return v.steps.every((step, i) => isValidStep(step, EXPECTED_STEP_TYPES[i]));
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const skillName: unknown = body?.skillName;
  const jdText: unknown = body?.jdText;

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

  try {
    const model = getGeminiClient().getGenerativeModel({
      model: DEFAULT_MODEL,
      systemInstruction: GENERATE_PRACTICE_SYSTEM_PROMPT,
      generationConfig: { responseMimeType: "application/json" },
    });

    const generation = await model.generateContent(buildGeneratePracticePrompt(skillName, jdText));
    const rawText = generation.response.text();

    const parsed: unknown = JSON.parse(extractJsonBlock(rawText));

    if (!isValidPracticeShape(parsed)) {
      throw new Error("Model response did not match the expected practice schema");
    }

    const result: GeneratePracticeResult = {
      lessonText: parsed.lessonText,
      steps: parsed.steps,
      usedFallback: false,
    };
    return NextResponse.json(result);
  } catch (error) {
    console.error("generate-practice failed, using fallback:", error);
    return NextResponse.json(buildFallbackPractice(skillName));
  }
}
