// Model đôi khi trả JSON kèm text thừa dù đã yêu cầu "chỉ trả JSON" trong
// system prompt — hàm này trích phần {...} ngoài cùng trước khi JSON.parse,
// dùng chung cho mọi API route gọi Gemini.
export function extractJsonBlock(text: string): string {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("No JSON object found in model response");
  }
  return text.slice(start, end + 1);
}
