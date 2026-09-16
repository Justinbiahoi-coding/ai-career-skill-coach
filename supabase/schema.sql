-- AI Career Skill Coach — database schema.
--
-- Two tiers, by design:
--   1. BUILT AND WIRED TONIGHT: profiles, skill_progress, interview_history.
--      These back the XP/streak/history features actually connected in this
--      PR. Every column here is read or written by real application code.
--   2. RESERVED FOR PLANNED FEATURES: resumes, job_search_preferences,
--      lesson_attempts, course_recommendations. Created now so the shape is
--      right from day one — job filters, CV upload, Duolingo-style multi-
--      exercise practice, and AI course suggestions all need somewhere to
--      land — but nothing in the app writes to them yet. Adding a feature
--      later fills in a table; it doesn't require an schema redesign.
--
-- Run this once in the Supabase SQL Editor (Dashboard > SQL Editor > New
-- query). Safe to re-run: every statement is idempotent.

-- =============================================================================
-- TIER 1 — wired up in this PR
-- =============================================================================

-- One row per user. Extends auth.users rather than duplicating its fields;
-- id is both primary key and foreign key, so a profile can't outlive its user.
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  xp integer not null default 0,
  streak_days integer not null default 0,
  last_active_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

drop policy if exists "profiles_select_own" on profiles;
create policy "profiles_select_own" on profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on profiles;
create policy "profiles_insert_own" on profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on profiles;
create policy "profiles_update_own" on profiles
  for update using (auth.uid() = id);

-- Which skills a user has completed practice for. skill_name is free text
-- (matching lib/types.ts Skill.name, which is AI-extracted and unbounded —
-- there is no fixed skill catalog to foreign-key against), so the natural
-- key is (user_id, skill_name) rather than a synthetic one.
create table if not exists skill_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  skill_name text not null,
  practiced_at timestamptz not null default now(),
  primary key (user_id, skill_name)
);

alter table skill_progress enable row level security;

drop policy if exists "skill_progress_select_own" on skill_progress;
create policy "skill_progress_select_own" on skill_progress
  for select using (auth.uid() = user_id);

drop policy if exists "skill_progress_insert_own" on skill_progress;
create policy "skill_progress_insert_own" on skill_progress
  for insert with check (auth.uid() = user_id);

-- One row per completed interview (single-skill or full). kind distinguishes
-- them since they score on different axes (InterviewScoreResult vs
-- FullInterviewScoreResult in lib/types.ts); scores land in jsonb rather than
-- individual columns so either shape fits without a second table.
create table if not exists interview_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('single_skill', 'full')),
  skill_name text,
  scores jsonb not null,
  used_fallback boolean not null default false,
  created_at timestamptz not null default now()
);

alter table interview_history enable row level security;

drop policy if exists "interview_history_select_own" on interview_history;
create policy "interview_history_select_own" on interview_history
  for select using (auth.uid() = user_id);

drop policy if exists "interview_history_insert_own" on interview_history;
create policy "interview_history_insert_own" on interview_history
  for insert with check (auth.uid() = user_id);

create index if not exists interview_history_user_id_created_at_idx
  on interview_history (user_id, created_at desc);

-- =============================================================================
-- TIER 2 — reserved for planned features, unused by app code today
-- =============================================================================

-- CV upload (planned): the file lives in Supabase Storage, not this table —
-- storage_path is a pointer to it. parsed_data is jsonb because the shape of
-- "what we extracted from a resume" (experience, skills, education...) isn't
-- settled yet; a jsonb column absorbs that uncertainty without a migration
-- once it is.
create table if not exists resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  parsed_text text,
  parsed_data jsonb,
  uploaded_at timestamptz not null default now()
);

alter table resumes enable row level security;

drop policy if exists "resumes_select_own" on resumes;
create policy "resumes_select_own" on resumes
  for select using (auth.uid() = user_id);

drop policy if exists "resumes_insert_own" on resumes;
create policy "resumes_insert_own" on resumes
  for insert with check (auth.uid() = user_id);

drop policy if exists "resumes_delete_own" on resumes;
create policy "resumes_delete_own" on resumes
  for delete using (auth.uid() = user_id);

-- Job search filters (planned): job type, location, work mode. One row per
-- user — a saved default, not a history — so upsert on user_id is the
-- expected write pattern once this ships.
create table if not exists job_search_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  job_types text[] not null default '{}',       -- e.g. 'full_time', 'part_time'
  work_modes text[] not null default '{}',       -- e.g. 'onsite', 'remote', 'hybrid'
  locations text[] not null default '{}',        -- free-text city/district
  updated_at timestamptz not null default now()
);

alter table job_search_preferences enable row level security;

drop policy if exists "job_search_preferences_select_own" on job_search_preferences;
create policy "job_search_preferences_select_own" on job_search_preferences
  for select using (auth.uid() = user_id);

drop policy if exists "job_search_preferences_upsert_own" on job_search_preferences;
create policy "job_search_preferences_upsert_own" on job_search_preferences
  for insert with check (auth.uid() = user_id);

drop policy if exists "job_search_preferences_update_own" on job_search_preferences;
create policy "job_search_preferences_update_own" on job_search_preferences
  for update using (auth.uid() = user_id);

-- Duolingo-style multi-exercise practice (planned): today's schema is one
-- lesson + one exercise per skill (lib/types.ts GenerateLessonResult). The
-- planned version is several exercises per skill in different formats, so
-- this logs one row per exercise attempt rather than one per lesson —
-- exercise_index and exercise_type are what let several attempts on the same
-- skill be told apart and grouped.
create table if not exists lesson_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  skill_name text not null,
  exercise_index integer not null default 0,
  exercise_type text,                            -- e.g. 'free_text', 'multiple_choice', 'reorder'
  score integer,
  feedback text,
  attempted_at timestamptz not null default now()
);

alter table lesson_attempts enable row level security;

drop policy if exists "lesson_attempts_select_own" on lesson_attempts;
create policy "lesson_attempts_select_own" on lesson_attempts
  for select using (auth.uid() = user_id);

drop policy if exists "lesson_attempts_insert_own" on lesson_attempts;
create policy "lesson_attempts_insert_own" on lesson_attempts
  for insert with check (auth.uid() = user_id);

-- AI-recommended courses (planned): recommendations are generated content,
-- not user input, so there is no update/delete policy — the app inserts,
-- the user reads, and a stale recommendation is superseded by a new row
-- rather than edited in place.
create table if not exists course_recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  skill_name text not null,
  course_title text not null,
  course_url text,
  reason text,
  recommended_at timestamptz not null default now()
);

alter table course_recommendations enable row level security;

drop policy if exists "course_recommendations_select_own" on course_recommendations;
create policy "course_recommendations_select_own" on course_recommendations
  for select using (auth.uid() = user_id);

drop policy if exists "course_recommendations_insert_own" on course_recommendations;
create policy "course_recommendations_insert_own" on course_recommendations
  for insert with check (auth.uid() = user_id);
