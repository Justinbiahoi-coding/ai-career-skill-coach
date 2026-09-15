import { NextResponse } from "next/server";
import { getAnthropicClient, HAIKU_MODEL } from "@/lib/anthropic";

// Route tạm dùng để verify Part 0 - Prepare: Claude API key hoạt động.
// Xoá route này sau khi các API route thật (extract-skills, ...) đã chạy được.
export async function GET() {
  const message = await getAnthropicClient().messages.create({
    model: HAIKU_MODEL,
    max_tokens: 100,
    messages: [{ role: "user", content: "Say hello in one short sentence." }],
  });

  const text = message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");

  return NextResponse.json({ ok: true, text });
}
