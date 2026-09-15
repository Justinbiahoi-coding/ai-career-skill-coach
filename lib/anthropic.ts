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

// Đã nâng cấp (2026-09-15): dùng Sonnet 4.6 cho TẤT CẢ 5 API call, không
// còn tách Haiku/Sonnet theo bước. Lý do: chất lượng phân tích skill-gap và
// nội dung dạy/chấm điểm quan trọng hơn phần chênh lệch tốc độ (Sonnet vẫn
// đủ nhanh cho demo trực tiếp, ~2-5s/call), đặc biệt vì "AI accuracy in
// skill gap analysis" là blind spot rủi ro cao nhất theo báo cáo BlindSpot.
export const SONNET_MODEL = "claude-sonnet-4-6";

// Giữ lại để dễ hạ cấp cục bộ nếu 1 bước cụ thể cần phản hồi nhanh hơn khi
// demo (không dùng ở đâu mặc định nữa).
export const HAIKU_MODEL = "claude-haiku-4-5";

// Model mặc định cho mọi route — trỏ về SONNET_MODEL theo quyết định trên.
export const DEFAULT_MODEL = SONNET_MODEL;
