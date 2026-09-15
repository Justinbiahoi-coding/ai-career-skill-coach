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

// Gemini 2.5 Flash (KHÔNG phải Flash-Lite) — free tier qua Google AI Studio,
// chất lượng suy luận/chấm điểm tốt hơn Flash-Lite, vẫn đủ nhanh cho demo
// trực tiếp. Dùng cho tất cả 5 API call của sản phẩm.
export const DEFAULT_MODEL = "gemini-2.5-flash";
