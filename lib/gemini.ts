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

// Lịch sử chọn model (tất cả đều xác minh bằng lệnh gọi API thật 2026-09-15):
//   1. `gemini-2.5-flash`  -> 404, Google đã ngừng cấp cho API key mới.
//   2. `gemini-3.6-flash`  -> chạy được nhưng free tier CHỈ 20 request/NGÀY
//      (quotaId GenerateRequestsPerDayPerProjectPerModel-FreeTier). Một lượt
//      dùng app đầy đủ tốn ~8 lệnh gọi -> chỉ ~2 lượt/ngày, chắc chắn hết
//      quota giữa buổi demo/user testing.
//   3. `gemini-3.5-flash-lite` (đang dùng) -> quota free cao hơn hẳn, và test
//      thực tế cho thấy chất lượng trích xuất skill vẫn đúng trọng tâm.
// Đánh đổi: suy luận nông hơn bản Flash đầy đủ, chấp nhận được vì độ ổn định
// khi demo quan trọng hơn.
export const DEFAULT_MODEL = "gemini-3.5-flash-lite";
