import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

// Lazy singleton: tránh đọc process.env.ANTHROPIC_API_KEY ở module scope,
// vì `next build` load module này để phân tích route và sẽ throw ở build
// time nếu chưa có .env.local. Lỗi thiếu key giờ chỉ xảy ra khi thật sự
// gọi API (request time), không chặn được `npm run build`.
export function getAnthropicClient(): Anthropic {
  if (!client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("Missing ANTHROPIC_API_KEY environment variable");
    }
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

// Dùng cho các call tần suất cao / không cần suy luận sâu:
// extract-skills, generate-lesson, grade-exercise, interview-turn.
export const HAIKU_MODEL = "claude-haiku-4-5";

// Dùng riêng cho bước chấm điểm mock interview cuối cùng (interview-score),
// nơi chất lượng nhận xét quan trọng hơn tốc độ/chi phí.
export const SONNET_MODEL = "claude-sonnet-4-6";
