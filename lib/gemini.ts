import {
  GoogleGenerativeAI,
  GoogleGenerativeAIFetchError,
  type GenerationConfig,
} from "@google/generative-ai";

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

// Danh sách API key theo thứ tự ưu tiên. GEMINI_API_KEY_2 là dự phòng — cùng
// một project Google Cloud vẫn có quota RIÊNG theo từng key, nên khi key
// chính hết quota trong ngày (429), thử tiếp key phụ tăng gấp đôi số lượt
// dùng được trước khi hết hạn demo. Không bắt buộc phải có key phụ.
function apiKeys(): string[] {
  return [process.env.GEMINI_API_KEY, process.env.GEMINI_API_KEY_2].filter(
    (k): k is string => Boolean(k)
  );
}

const clients = new Map<string, GoogleGenerativeAI>();

function clientFor(apiKey: string): GoogleGenerativeAI {
  let client = clients.get(apiKey);
  if (!client) {
    client = new GoogleGenerativeAI(apiKey);
    clients.set(apiKey, client);
  }
  return client;
}

// Lazy: tránh đọc process.env ở module scope, vì `next build` load module
// này để phân tích route và sẽ throw ở build time nếu chưa có .env.local.
// Lỗi thiếu key giờ chỉ xảy ra khi thật sự gọi API (request time).
export function getGeminiClient(): GoogleGenerativeAI {
  const keys = apiKeys();
  if (keys.length === 0) {
    throw new Error("Missing GEMINI_API_KEY environment variable");
  }
  return clientFor(keys[0]);
}

function isQuotaError(error: unknown): boolean {
  // 429 = RESOURCE_EXHAUSTED (hết quota). 503 cũng được coi là tạm thời và
  // đáng thử key khác, vì free tier hay trả 503 khi server quá tải chứ
  // không hẳn là lỗi vĩnh viễn của riêng key đó.
  return error instanceof GoogleGenerativeAIFetchError && (error.status === 429 || error.status === 503);
}

export interface GenerateOptions {
  systemInstruction: string;
  generationConfig?: GenerationConfig;
}

/**
 * Gọi Gemini với tự động chuyển key khi gặp lỗi quota/quá tải.
 *
 * Thay cho việc mỗi route tự gọi `getGeminiClient().getGenerativeModel(...)`
 * rồi `model.generateContent(...)` — cách đó chỉ dùng đúng 1 key, key hết
 * quota là toàn bộ route rơi thẳng về fallback dù key phụ vẫn còn quota.
 */
export async function generateWithFailover(
  prompt: string,
  options: GenerateOptions
): Promise<string> {
  const keys = apiKeys();
  if (keys.length === 0) {
    throw new Error("Missing GEMINI_API_KEY environment variable");
  }

  let lastError: unknown;
  for (const [index, key] of keys.entries()) {
    try {
      const model = clientFor(key).getGenerativeModel({
        model: DEFAULT_MODEL,
        systemInstruction: options.systemInstruction,
        generationConfig: options.generationConfig,
      });
      const generation = await model.generateContent(prompt);
      return generation.response.text();
    } catch (error) {
      lastError = error;
      const hasMoreKeys = index < keys.length - 1;
      if (isQuotaError(error) && hasMoreKeys) {
        console.warn(`Gemini key ${index + 1} hit quota/overload, trying next key`);
        continue;
      }
      throw error;
    }
  }
  // Không tới được đây trong thực tế (vòng lặp luôn return hoặc throw ở trên),
  // nhưng TypeScript cần một đường thoát tường minh cho hàm async.
  throw lastError;
}
