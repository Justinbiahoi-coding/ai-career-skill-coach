-- Migration 004 — course video cache for the new "Courses" feature.
--
-- Run this in the Supabase SQL Editor AFTER migration-003. Safe to re-run.
--
-- Context: /courses lets a student pick a skill (from their analyzed saved
-- jobs) and see real YouTube search results for it. YouTube Data API's free
-- tier is ~10,000 units/day and a single search.list call costs 100 units —
-- about 100 searches/day for the WHOLE app. Caching is not optional here.
--
-- This is intentionally a SEPARATE table from the existing
-- course_recommendations (see schema.sql, Tier 2, still unused elsewhere):
-- that table is per-user (user_id not null, RLS select-own), which would
-- mean 10 students all searching "SQL" trigger 10 separate YouTube calls
-- instead of 1. A cache that actually saves quota has to be keyed on the
-- skill itself, shared across every user — so this is a new table, and
-- course_recommendations is left untouched as a reserved table for a future,
-- genuinely per-user feature (e.g. an AI-written personal "reason" per user).

create table if not exists course_video_cache (
  -- Normalized (trim + lowercase) skill name — see normalizeSkillKey() in
  -- lib/course-recommendations.ts. The primary key IS the cache key.
  skill_name text primary key,
  -- CourseVideo[] from lib/types.ts — real YouTube search.list results,
  -- never AI-generated. Stored as jsonb since it's read back as one unit
  -- per skill, never queried by individual video.
  videos jsonb not null,
  fetched_at timestamptz not null default now(),
  -- true if this row was written after a failed/empty search rather than a
  -- successful one — lets a later request know "this might be stale or
  -- there was nothing to find" without needing a separate error table.
  used_fallback boolean not null default false
);

alter table course_video_cache enable row level security;

-- Every signed-in user can read the shared cache — it's not personal data,
-- just cached search results everyone benefits from seeing.
drop policy if exists "course_video_cache_select_authenticated" on course_video_cache;
create policy "course_video_cache_select_authenticated" on course_video_cache
  for select using (auth.role() = 'authenticated');

-- Deliberately NO insert/update policy for authenticated/anon clients. This
-- table is shared across every user, so letting any signed-in client write
-- to it would let one user's bad data (or a malicious one) pollute what
-- everyone else sees. Only the server-side route (app/api/courses/search)
-- writes to it, using the Supabase service-role key, which bypasses RLS
-- entirely — see lib/supabase/service-role.ts.
