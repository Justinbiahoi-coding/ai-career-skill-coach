import { NextResponse } from "next/server";
import { generateWithFailover } from "@/lib/gemini";
import {
  KNOWLEDGE_CARD_SYSTEM_PROMPT,
  MAX_JD_LENGTH,
  MIXED_CARD_SYSTEM_PROMPT,
  DRILL_ITEM_COUNTS,
  MIXED_ITEM_COUNT,
  buildDrillCardPrompt,
  buildDrillCardSystemPrompt,
  buildKnowledgeCardPrompt,
} from "@/lib/prompts";
import {
  buildFallbackDrillCard,
  buildFallbackKnowledgeCard,
  buildFallbackMixedCard,
} from "@/lib/fallback-data";
import { extractJsonBlock } from "@/lib/json-utils";
import type {
  DrillCardResult,
  DrillStepType,
  KnowledgeCardResult,
  MixedCardResult,
  PracticeStep,
} from "@/lib/types";

const MAX_SKILL_NAME_LENGTH = 200;
const DRILL_TYPES = Object.keys(DRILL_ITEM_COUNTS) as DrillStepType[];
const VALID_MODES = ["knowledge", ...DRILL_TYPES, "mixed"] as const;
type Mode = (typeof VALID_MODES)[number];

// Same shape checks as the old single-call design, just applied per-item
// now that a card holds several items of one type (or, for mixed, several
// types at once) instead of exactly one of each.
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

function isValidKnowledgeShape(value: unknown): value is { articleText: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Record<string, unknown>).articleText === "string"
  );
}

// A single-type drill card: every item must be that one type, and there
// must be at least half the requested count — the model occasionally
// under-delivers by one or two items, which is still a usable card, unlike
// falling all the way back to placeholder content over a minor shortfall.
function isValidDrillShape(
  value: unknown,
  type: DrillStepType,
  expectedCount: number
): value is { items: PracticeStep[] } {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  if (!Array.isArray(v.items) || v.items.length < Math.ceil(expectedCount / 2)) return false;
  return v.items.every((item) => isValidStep(item, type));
}

// Mixed card: every item must be SOME valid drill step type (mixed order is
// the point), and again tolerate a shortfall rather than reject outright.
function isValidMixedShape(value: unknown): value is { items: PracticeStep[] } {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  if (!Array.isArray(v.items) || v.items.length < Math.ceil(MIXED_ITEM_COUNT / 2)) return false;
  return v.items.every((item) => DRILL_TYPES.some((t) => isValidStep(item, t)));
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const skillName: unknown = body?.skillName;
  const jdText: unknown = body?.jdText;
  const mode: unknown = body?.mode;

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
  if (typeof mode !== "string" || !VALID_MODES.includes(mode as Mode)) {
    return NextResponse.json(
      { error: `mode must be one of: ${VALID_MODES.join(", ")}` },
      { status: 400 }
    );
  }

  const typedMode = mode as Mode;

  try {
    if (typedMode === "knowledge") {
      const rawText = await generateWithFailover(buildKnowledgeCardPrompt(skillName, jdText), {
        systemInstruction: KNOWLEDGE_CARD_SYSTEM_PROMPT,
        generationConfig: { responseMimeType: "application/json" },
      });
      const parsed: unknown = JSON.parse(extractJsonBlock(rawText));
      if (!isValidKnowledgeShape(parsed)) {
        throw new Error("Model response did not match the expected knowledge card schema");
      }
      const result: KnowledgeCardResult = { articleText: parsed.articleText, usedFallback: false };
      return NextResponse.json(result);
    }

    if (typedMode === "mixed") {
      const rawText = await generateWithFailover(buildDrillCardPrompt(skillName, jdText), {
        systemInstruction: MIXED_CARD_SYSTEM_PROMPT,
        generationConfig: { responseMimeType: "application/json" },
      });
      const parsed: unknown = JSON.parse(extractJsonBlock(rawText));
      if (!isValidMixedShape(parsed)) {
        throw new Error("Model response did not match the expected mixed card schema");
      }
      const result: MixedCardResult = { items: parsed.items, usedFallback: false };
      return NextResponse.json(result);
    }

    // One of the 5 single-type drill cards.
    const expectedCount = DRILL_ITEM_COUNTS[typedMode] ?? 4;
    const rawText = await generateWithFailover(buildDrillCardPrompt(skillName, jdText), {
      systemInstruction: buildDrillCardSystemPrompt(typedMode),
      generationConfig: { responseMimeType: "application/json" },
    });
    const parsed: unknown = JSON.parse(extractJsonBlock(rawText));
    if (!isValidDrillShape(parsed, typedMode, expectedCount)) {
      throw new Error(`Model response did not match the expected ${typedMode} drill card schema`);
    }
    const result: DrillCardResult = { items: parsed.items, usedFallback: false };
    return NextResponse.json(result);
  } catch (error) {
    console.error(`generate-practice (mode=${typedMode}) failed, using fallback:`, error);
    if (typedMode === "knowledge") {
      return NextResponse.json(buildFallbackKnowledgeCard(skillName));
    }
    if (typedMode === "mixed") {
      return NextResponse.json(buildFallbackMixedCard(skillName));
    }
    return NextResponse.json(buildFallbackDrillCard(typedMode, skillName));
  }
}
