import { createServiceRoleClient } from "./supabase/service-role";
import { listSavedJobs } from "./saved-jobs";
import type { CourseVideo } from "./types";

/**
 * Data access for the Courses feature — split across two contexts:
 *
 * - listUserSkills() runs on the CLIENT (called from the "use client"
 *   /courses page, same as every saved-jobs.ts function), reading through
 *   the normal signed-in user's session and RLS.
 * - The cache functions run on the SERVER (called only from
 *   app/api/courses/search/route.ts), using the service-role client because
 *   course_video_cache has no user_id column — it's shared across every
 *   signed-in user, not scoped to one, so there's no per-user RLS policy a
 *   normal client could satisfy to write to it.
 */

/** How long a cached search stays "fresh" before a new one is attempted. */
export const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/** Normalizes a skill name into the cache table's key — trim + lowercase. */
export function normalizeSkillKey(skillName: string): string {
  return skillName.trim().toLowerCase();
}

/**
 * Every distinct skill across the signed-in user's analyzed saved jobs, for
 * the /courses skill-picker screen. Jobs that haven't been analyzed yet
 * (skills: null) are skipped — there's nothing to list from them. Dedupes
 * case-insensitively (the same skill can be extracted with slightly
 * different casing across different jobs) but keeps the first casing seen,
 * so the UI shows "SQL" rather than a lowercased "sql".
 */
export async function listUserSkills(): Promise<string[]> {
  const jobs = await listSavedJobs();
  const seen = new Map<string, string>(); // normalized key -> display name

  for (const job of jobs) {
    if (!job.skills) continue;
    for (const skill of job.skills) {
      const key = normalizeSkillKey(skill.name);
      if (!seen.has(key)) seen.set(key, skill.name);
    }
  }

  return Array.from(seen.values());
}

interface CourseVideoCacheRow {
  videos: CourseVideo[];
  fetchedAt: string;
  usedFallback: boolean;
}

/** Reads whatever is cached for a skill, regardless of age — the caller decides if it's too stale. */
export async function getCachedCourseVideos(skillName: string): Promise<CourseVideoCacheRow | null> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("course_video_cache")
    .select("videos, fetched_at, used_fallback")
    .eq("skill_name", normalizeSkillKey(skillName))
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    videos: (data.videos as CourseVideo[] | null) ?? [],
    fetchedAt: data.fetched_at as string,
    usedFallback: Boolean(data.used_fallback),
  };
}

/**
 * Overwrites the cache entry for a skill — always a fresh search result (or
 * an explicit empty/fallback marker), never merged with the old value, since
 * a new search result fully replaces what's useful about the old one.
 */
export async function upsertCourseVideoCache(
  skillName: string,
  videos: CourseVideo[],
  usedFallback: boolean
): Promise<void> {
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("course_video_cache").upsert({
    skill_name: normalizeSkillKey(skillName),
    videos,
    used_fallback: usedFallback,
    fetched_at: new Date().toISOString(),
  });
  if (error) throw error;
}
