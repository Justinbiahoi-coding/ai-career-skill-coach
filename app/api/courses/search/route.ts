import { NextResponse } from "next/server";
import { searchYoutubeVideos, YoutubeQuotaError } from "@/lib/youtube";
import {
  CACHE_TTL_MS,
  getCachedCourseVideos,
  upsertCourseVideoCache,
} from "@/lib/course-recommendations";
import type { CourseSearchResult } from "@/lib/types";

const MAX_SKILL_LENGTH = 100;

export async function GET(request: Request) {
  const skill = new URL(request.url).searchParams.get("skill")?.trim() ?? "";

  if (skill.length === 0) {
    return NextResponse.json({ error: "skill is required" }, { status: 400 });
  }
  if (skill.length > MAX_SKILL_LENGTH) {
    return NextResponse.json(
      { error: `skill must be at most ${MAX_SKILL_LENGTH} characters` },
      { status: 400 }
    );
  }

  // Cache-first: real search results are expensive (YouTube's free tier is
  // ~100 searches/day total for the whole app), so many students hitting the
  // same skill (e.g. "SQL") should all get one shared, recent result instead
  // of each spending a search of the daily quota.
  let cached;
  try {
    cached = await getCachedCourseVideos(skill);
  } catch (error) {
    console.error("course cache read failed:", error);
    cached = null;
  }

  const isFresh = cached && Date.now() - new Date(cached.fetchedAt).getTime() < CACHE_TTL_MS;
  if (cached && isFresh && cached.videos.length > 0) {
    const result: CourseSearchResult = {
      skillName: skill,
      videos: cached.videos,
      usedFallback: false,
    };
    return NextResponse.json(result);
  }

  try {
    const videos = await searchYoutubeVideos(`${skill} tutorial`);

    if (videos.length === 0) {
      // A real, empty search result — not an error. Nothing to cache as
      // "successful", but nothing to fabricate either.
      const result: CourseSearchResult = { skillName: skill, videos: [], usedFallback: true };
      return NextResponse.json(result);
    }

    // Best-effort cache write — a failure here shouldn't fail the request
    // the user is actually waiting on, since they already have real results.
    void upsertCourseVideoCache(skill, videos, false).catch((error) => {
      console.error("course cache write failed:", error);
    });

    const result: CourseSearchResult = { skillName: skill, videos, usedFallback: false };
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof YoutubeQuotaError) {
      console.error("YouTube quota exceeded for skill:", skill);
    } else {
      console.error("YouTube search failed:", error);
    }

    // No fresh results — fall back to whatever was cached before, even if
    // stale. It's still a set of real videos, just not the newest search.
    // Only when there's truly nothing do we return an empty list.
    const result: CourseSearchResult = {
      skillName: skill,
      videos: cached?.videos ?? [],
      usedFallback: true,
    };
    return NextResponse.json(result);
  }
}
