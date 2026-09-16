-- Migration 002 — saved jobs become the entry point, progress becomes per-job.
--
-- Run this in the Supabase SQL Editor AFTER schema.sql. Safe to re-run.
--
-- Context: the app used to be one linear flow (find job -> rate -> practice ->
-- interview) where "the job" was whatever sat in sessionStorage. The three
-- areas are now separate: Find Job saves jobs, Practice picks one of them to
-- analyze and drill, Mock Test picks one to be interviewed on. That makes the
-- saved job the unit everything else hangs off, and makes "have I practiced
-- enough for THIS job" a question the schema has to be able to answer.

-- 1. skills is now nullable: a job is saved the moment it's picked in Find
--    Job, before any AI call. It stays null until Practice analyzes it, which
--    is also how the UI tells "saved" from "analyzed" apart.
alter table saved_jobs alter column skills drop not null;

-- 2. Which job a saved posting came from, so the list can link back out to
--    the original posting and show its source.
alter table saved_jobs add column if not exists source text;
alter table saved_jobs add column if not exists url text;

-- schema.sql never added an UPDATE policy for saved_jobs because nothing
-- used to update a saved job after inserting it. Practice now does exactly
-- that (updateJobSkills, once extract-skills has run) — without this policy
-- RLS silently returns 0 rows updated rather than an error, so the skills
-- column would look permanently null even though the API call "succeeded".
drop policy if exists "saved_jobs_update_own" on saved_jobs;
create policy "saved_jobs_update_own" on saved_jobs
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 3. Practice progress moves from per-user to per-user-per-job.
--
--    The old primary key (user_id, skill_name) treated "SQL" as one thing
--    across every job: practicing SQL for a Data Analyst role would mark it
--    done for a Backend role too, and Mock Test couldn't warn "you've only
--    practiced 2 of 5 skills for THIS job". job_id fixes that.
--
--    Existing rows predate saved jobs entirely, so they have no job to point
--    at. Rather than invent one, job_id is nullable and those rows stay as
--    account-wide history — they just don't count toward any job's progress.
alter table skill_progress add column if not exists job_id uuid references saved_jobs(id) on delete cascade;

-- Swap the primary key to include job_id. Postgres can't have two rows with
-- the same (user_id, skill_name) under the old key, which would block the
-- same skill being practiced for two different jobs.
alter table skill_progress drop constraint if exists skill_progress_pkey;
alter table skill_progress add column if not exists id uuid primary key default gen_random_uuid();

-- One row per (user, job, skill) — practicing the same skill twice for the
-- same job updates rather than duplicates.
create unique index if not exists skill_progress_user_job_skill_idx
  on skill_progress (user_id, job_id, skill_name)
  where job_id is not null;

create index if not exists skill_progress_user_job_idx
  on skill_progress (user_id, job_id);

-- persistSkillPracticed now upserts (onConflict: user_id,job_id,skill_name)
-- when a job is attached, which needs UPDATE permission for the conflict
-- branch — the pre-migration policy only ever granted INSERT because plain
-- inserts were all it did.
drop policy if exists "skill_progress_update_own" on skill_progress;
create policy "skill_progress_update_own" on skill_progress
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 4. interview_history gains the same link, so "which interviews have I done
--    for this job" is answerable on the Mock Test screen.
alter table interview_history add column if not exists job_id uuid references saved_jobs(id) on delete cascade;

create index if not exists interview_history_job_idx
  on interview_history (user_id, job_id, created_at desc);
