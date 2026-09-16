import { NextResponse } from "next/server";
import { getGeminiClient, DEFAULT_MODEL } from "@/lib/gemini";
import { GRADE_EXERCISE_SYSTEM_PROMPT, buildGradeExercisePrompt } from "@/lib/prompts";
import { FALLBACK_STEP_GRADE } from "@/lib/fallback-data";
import { extractJsonBlock } from "@/lib/json-utils";
import type { GradeStepResult } from "@/lib/types";

// Grades the free_text and mini_dialogue steps of a practice session — the
// two whose answer isn't checkable against a fixed correct value. Shares its
// rubric with the original /api/grade-exercise: "does this answer
// demonstrate the skill" doesn't change based on which step asked it.

const MAX_TEXT_LENGTH = 2000;
const MAX_SKILL_NAME_LENGTH = 200;

function isValidGradeShape(value: unknown): value is { score: number; feedback: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { score: unknown }).score === "number" &&
    typeof (value as { feedback: unknown }).feedback === "string"
  );
}

function requireNonEmptyString(value: unknown, field: string, maxLength: number) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return NextResponse.json({ error: `${field} is required` }, { status: 400 });
  }
  if (value.length > maxLength) {
    return NextResponse.json(
      { error: `${field} must be at most ${maxLength} characters` },
      { status: 400 }
    );
  }
  return null;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const skillName: unknown = body?.skillName;
  const prompt: unknown = body?.prompt;
  const answer: unknown = body?.answer;

  const skillNameError = requireNonEmptyString(skillName, "skillName", MAX_SKILL_NAME_LENGTH);
  if (skillNameError) return skillNameError;

  const promptError = requireNonEmptyString(prompt, "prompt", MAX_TEXT_LENGTH);
  if (promptError) return promptError;

  const answerError = requireNonEmptyString(answer, "answer", MAX_TEXT_LENGTH);
  if (answerError) return answerError;

  try {
    const model = getGeminiClient().getGenerativeModel({
      model: DEFAULT_MODEL,
      systemInstruction: GRADE_EXERCISE_SYSTEM_PROMPT,
      generationConfig: { responseMimeType: "application/json" },
    });

    const generation = await model.generateContent(
      buildGradeExercisePrompt(skillName as string, prompt as string, answer as string)
    );
    const rawText = generation.response.text();

    const parsed: unknown = JSON.parse(extractJsonBlock(rawText));

    if (!isValidGradeShape(parsed)) {
      throw new Error("Model response did not match the expected schema");
    }

    const result: GradeStepResult = {
      score: parsed.score,
      feedback: parsed.feedback,
      usedFallback: false,
    };
    return NextResponse.json(result);
  } catch (error) {
    console.error("grade-step failed, using fallback:", error);
    return NextResponse.json(FALLBACK_STEP_GRADE);
  }
}
