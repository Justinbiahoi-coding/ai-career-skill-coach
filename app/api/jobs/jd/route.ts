import { NextResponse } from "next/server";
import { fetchJobDescription, isAllowedJobUrl } from "@/lib/job-sources";
import type { JobDescriptionResult } from "@/lib/types";

export async function GET(request: Request) {
  const url = new URL(request.url).searchParams.get("url")?.trim() ?? "";

  if (url.length === 0) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }
  // Route này nhận URL từ client rồi tự đi fetch, nên phải chặn mọi tên miền
  // ngoài danh sách cho phép — không chặn thì client có thể ép server gọi vào
  // địa chỉ nội bộ (SSRF). Đây là lỗi của phía gọi, không phải sự cố tạm thời,
  // nên trả 400 thay vì rơi về fallback.
  if (!isAllowedJobUrl(url)) {
    return NextResponse.json({ error: "url is not an allowed job source" }, { status: 400 });
  }

  try {
    const jdText = await fetchJobDescription(url);
    if (jdText.length === 0) throw new Error("Extracted job description was empty");
    const result: JobDescriptionResult = { jdText, usedFallback: false };
    return NextResponse.json(result);
  } catch (error) {
    console.error("job description fetch failed:", error);
    // Trang nguồn có thể đổi HTML hoặc chặn bất cứ lúc nào. Trả 200 kèm cờ
    // usedFallback để UI mời người dùng mở link gốc và tự dán JD, thay vì hiện
    // lỗi đỏ giữa lúc demo.
    const result: JobDescriptionResult = { jdText: "", usedFallback: true };
    return NextResponse.json(result);
  }
}
