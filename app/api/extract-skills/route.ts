import { NextResponse } from "next/server";
import { getAnthropicClient, DEFAULT_MODEL } from "@/lib/anthropic";
import { EXTRACT_SKILLS_SYSTEM_PROMPT, buildExtractSkillsPrompt } from "@/lib/prompts";
import { FALLBACK_SKILLS } from "@/lib/fallback-data";
import type { ExtractSkillsResult, Skill } from "@/lib/types";

const MAX_JD_LENGTH = 3000;

function extractJsonBlock(text: string): string {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("No JSON object found in model response");
  }
  return text.slice(start, end + 1);
}

function isValidSkillsShape(value: unknown): value is { skills: Skill[] } {
  if (typeof value !== "object" || value === null || !("skills" in value)) {
    return false;
  }
  const skills = (value as { skills: unknown }).skills;
  if (!Array.isArray(skills)) return false;
  return skills.every(
    (s) =>
      typeof s === "object" &&
      s !== null &&
      typeof (s as Skill).name === "string" &&
      ["high", "medium", "low"].includes((s as Skill).importance) &&
      ["hard", "soft"].includes((s as Skill).type)
  );
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const jdText: unknown = body?.jdText;

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
    const message = await getAnthropicClient().messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 1024,
      system: EXTRACT_SKILLS_SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildExtractSkillsPrompt(jdText) }],
    });

    const rawText = message.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("");

    const parsed: unknown = JSON.parse(extractJsonBlock(rawText));

    if (!isValidSkillsShape(parsed)) {
      throw new Error("Model response did not match the expected schema");
    }

    const result: ExtractSkillsResult = { skills: parsed.skills, usedFallback: false };
    return NextResponse.json(result);
  } catch (error) {
    console.error("extract-skills failed, using fallback:", error);
    const result: ExtractSkillsResult = { skills: FALLBACK_SKILLS, usedFallback: true };
    return NextResponse.json(result);
  }
}
