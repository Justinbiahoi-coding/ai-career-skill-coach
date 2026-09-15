import { GoogleGenerativeAI } from "@google/generative-ai";

let client: GoogleGenerativeAI | null = null;

// Lazy singleton: tránh đọc process.env.GEMINI_API_KEY ở module scope, vì
// `next build` load module này để phân tích route và sẽ throw ở build time
// nếu chưa có .env.local. Lỗi thiếu key giờ chỉ xảy ra khi thật sự gọi API
// (request time), không chặn được `npm run build`.
export function getGeminiClient(): GoogleGenerativeAI {
  if (!client) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Missing GEMINI_API_KEY environment variable");
    }
    client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return client;
}

// `gemini-2.5-flash` đã bị Google ngừng cấp cho API key mới (lỗi 404 xác
// nhận trực tiếp từ generativelanguage.googleapis.com lúc test thật ngày
// 2026-09-15), khuyến nghị chuyển sang `gemini-3.6-flash`. Dùng cho tất cả
// 5 API call của sản phẩm.
export const DEFAULT_MODEL = "gemini-3.6-flash";
