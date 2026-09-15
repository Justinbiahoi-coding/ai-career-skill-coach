import { NextResponse } from "next/server";
import { searchAllSources } from "@/lib/job-sources";
import { FALLBACK_JOBS } from "@/lib/fallback-data";
import type { JobSearchResult } from "@/lib/types";

const MAX_QUERY_LENGTH = 100;

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";

  if (query.length === 0) {
    return NextResponse.json({ error: "q is required" }, { status: 400 });
  }
  if (query.length > MAX_QUERY_LENGTH) {
    return NextResponse.json(
      { error: `q must be at most ${MAX_QUERY_LENGTH} characters` },
      { status: 400 }
    );
  }

  try {
    const jobs = await searchAllSources(query);
    // Cả 4 nguồn cùng không trả gì (mạng hỏng, hoặc từ khoá quá hẹp) thì vẫn
    // phải có job thật để demo chạy tiếp, thay vì hiện danh sách trống.
    if (jobs.length === 0) {
      const result: JobSearchResult = { jobs: FALLBACK_JOBS, usedFallback: true };
      return NextResponse.json(result);
    }
    const result: JobSearchResult = { jobs, usedFallback: false };
    return NextResponse.json(result);
  } catch (error) {
    console.error("job search failed, using fallback:", error);
    const result: JobSearchResult = { jobs: FALLBACK_JOBS, usedFallback: true };
    return NextResponse.json(result);
  }
}
