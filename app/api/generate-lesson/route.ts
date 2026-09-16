import { NextResponse } from "next/server";
import { generateWithFailover } from "@/lib/gemini";
import { GENERATE_LESSON_SYSTEM_PROMPT, MAX_JD_LENGTH, buildGenerateLessonPrompt } from "@/lib/prompts";
import { buildFallbackLesson } from "@/lib/fallback-data";
import { extractJsonBlock } from "@/lib/json-utils";
import type { GenerateLessonResult } from "@/lib/types";

const MAX_SKILL_NAME_LENGTH = 200;

function isValidLessonShape(
  value: unknown
): value is { lessonText: string; exercisePrompt: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { lessonText: unknown }).lessonText === "string" &&
    typeof (value as { exercisePrompt: unknown }).exercisePrompt === "string"
  );
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
    const rawText = await generateWithFailover(
      buildGenerateLessonPrompt(skillName, jdText),
      { systemInstruction: GENERATE_LESSON_SYSTEM_PROMPT, generationConfig: { responseMimeType: "application/json" } }
    );

    const parsed: unknown = JSON.parse(extractJsonBlock(rawText));

    if (!isValidLessonShape(parsed)) {
      throw new Error("Model response did not match the expected schema");
    }

    const result: GenerateLessonResult = {
      lessonText: parsed.lessonText,
      exercisePrompt: parsed.exercisePrompt,
      usedFallback: false,
    };
    return NextResponse.json(result);
  } catch (error) {
    console.error("generate-lesson failed, using fallback:", error);
    return NextResponse.json(buildFallbackLesson(skillName));
  }
}
