import { NextResponse } from "next/server";
import { generateWithFailover } from "@/lib/gemini";
import {
  DIALOGUE_REPLY_SYSTEM_PROMPT,
  MAX_DIALOGUE_TURNS,
  MAX_JD_LENGTH,
  buildDialogueReplyPrompt,
} from "@/lib/prompts";
import { buildFallbackDialogueReply } from "@/lib/fallback-data";
import { extractJsonBlock } from "@/lib/json-utils";
import type { DialogueReplyResult, DialogueTurn } from "@/lib/types";

const MAX_SKILL_NAME_LENGTH = 200;
const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_LENGTH = MAX_DIALOGUE_TURNS * 2 + 1;

function isValidHistory(value: unknown): value is DialogueTurn[] {
  if (!Array.isArray(value) || value.length > MAX_HISTORY_LENGTH) return false;
  return value.every((m): m is DialogueTurn => {
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

function isValidReplyShape(value: unknown): value is { reply: string; isLast: boolean } {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { reply: unknown }).reply === "string" &&
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

  // History is [opening question, student answer, (AI follow-up, student
  // answer)?]; student turns are every user message in it.
  const turnNumber = history.filter((m) => m.role === "user").length;

  try {
    const rawText = await generateWithFailover(
      buildDialogueReplyPrompt(skillName, jdText, history, turnNumber),
      { systemInstruction: DIALOGUE_REPLY_SYSTEM_PROMPT, generationConfig: { responseMimeType: "application/json" } }
    );

    const parsed: unknown = JSON.parse(extractJsonBlock(rawText));

    if (!isValidReplyShape(parsed)) {
      throw new Error("Model response did not match the expected schema");
    }

    const result: DialogueReplyResult = {
      reply: parsed.reply,
      // Chốt cứng isLast ở server khi đã hết lượt cho phép, không hoàn toàn
      // tin model — cùng nguyên tắc với /api/interview-turn.
      isLast: parsed.isLast || turnNumber >= MAX_DIALOGUE_TURNS,
      usedFallback: false,
    };
    return NextResponse.json(result);
  } catch (error) {
    console.error("dialogue-reply failed, using fallback:", error);
    return NextResponse.json(buildFallbackDialogueReply(turnNumber));
  }
}
