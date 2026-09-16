import type { CourseVideo } from "./types";

/**
 * YouTube Data API v3 — a real, official REST API returning JSON, not an
 * HTML page to scrape. Unlike lib/job-sources.ts (which fetches arbitrary
 * URLs a client can influence, and so needs an SSRF-safe hostname allowlist),
 * this always calls the same fixed googleapis.com endpoint the server
 * decides on its own — there's no client-supplied URL to validate.
 *
 * Free tier quota: 10,000 units/day, and search.list costs 100 units per
 * call — about 100 searches/day total for the whole app. Callers are
 * expected to cache by skill name (see lib/course-recommendations.ts)
 * rather than call this on every page view.
 */

const YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";
const FETCH_TIMEOUT_MS = 8000;
const MAX_RESULTS = 8;

interface YoutubeSearchItem {
  id?: { videoId?: string };
  snippet?: {
    title?: string;
    channelTitle?: string;
    publishedAt?: string;
    description?: string;
    thumbnails?: {
      medium?: { url?: string };
      default?: { url?: string };
    };
  };
}

interface YoutubeSearchResponse {
  items?: YoutubeSearchItem[];
  error?: { code?: number; message?: string; errors?: { reason?: string }[] };
}

export class YoutubeQuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "YoutubeQuotaError";
  }
}

function isValidItem(item: YoutubeSearchItem): item is Required<Pick<YoutubeSearchItem, "id" | "snippet">> & YoutubeSearchItem {
  return Boolean(item.id?.videoId && item.snippet?.title);
}

/**
 * Searches real YouTube videos for a query — no AI, no invented results.
 * Throws YoutubeQuotaError specifically on 403 quotaExceeded so callers can
 * tell "we're out of free searches today" apart from a transient network
 * failure, which matters for choosing what to log and how to degrade.
 */
export async function searchYoutubeVideos(query: string): Promise<CourseVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error("Missing YOUTUBE_API_KEY environment variable");
  }

  const params = new URLSearchParams({
    part: "snippet",
    q: query,
    type: "video",
    videoDuration: "medium",
    relevanceLanguage: "en",
    maxResults: String(MAX_RESULTS),
    safeSearch: "strict",
    key: apiKey,
  });

  const response = await fetch(`${YOUTUBE_SEARCH_URL}?${params.toString()}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  const body: YoutubeSearchResponse = await response.json().catch(() => ({}));

  if (!response.ok) {
    const isQuotaError =
      response.status === 403 &&
      (body.error?.errors ?? []).some((e) => e.reason === "quotaExceeded");
    if (isQuotaError) {
      throw new YoutubeQuotaError("YouTube Data API daily quota exceeded");
    }
    throw new Error(
      `YouTube search failed: ${response.status} ${body.error?.message ?? response.statusText}`
    );
  }

  return (body.items ?? []).filter(isValidItem).map((item) => ({
    videoId: item.id.videoId as string,
    title: item.snippet.title as string,
    channelTitle: item.snippet.channelTitle ?? "",
    thumbnailUrl:
      item.snippet.thumbnails?.medium?.url ?? item.snippet.thumbnails?.default?.url ?? "",
    publishedAt: item.snippet.publishedAt ?? "",
    description: item.snippet.description ?? "",
  }));
}
