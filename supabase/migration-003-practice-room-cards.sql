-- Migration 003 — Practice Room: per-card completion, not just per-skill.
--
-- Run this in the Supabase SQL Editor AFTER migration-002. Safe to re-run.
--
-- Context: Practice used to be "one skill -> one lesson -> one free-text
-- exercise -> done". It's now a room with 6 gradeable cards per skill
-- (multiple_choice, fill_blank, reorder, free_text, mini_dialogue, mixed —
-- "knowledge" is reading-only and never counted). A skill's % complete on
-- /gap is (cards finished / 6), so skill_progress needs to remember WHICH
-- cards were finished, not just whether the skill as a whole was touched.

-- completed_cards holds PracticeCardKind values, e.g. '{multiple_choice,fill_blank}'.
-- Nullable/defaulted to '{}' so existing rows (finished before this migration,
-- back when there was only one exercise per skill) read as "0 of 6 cards" —
-- they don't retroactively count as fully practiced, but they also don't
-- error out or disappear.
alter table skill_progress add column if not exists completed_cards text[] not null default '{}';

-- persistSkillPracticed's upsert already exists for (user_id, job_id,
-- skill_name); this migration only adds a column to that same row, so no
-- constraint or index changes are needed beyond what migration-002 set up.
