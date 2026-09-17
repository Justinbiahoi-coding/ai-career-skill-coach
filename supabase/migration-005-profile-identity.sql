-- Migration 005 — adds display identity to profiles: a short display name
-- and a gender, both collected once at sign-up, plus a real streak.
--
-- Run this in the Supabase SQL Editor AFTER migration-004. Safe to re-run.
--
-- Context: the navbar now shows a small avatar + display name + streak for
-- signed-in users. `profiles` already existed (see schema.sql) with
-- streak_days/last_active_date columns, but nothing in the app ever wrote to
-- them — persistXp() only ever touched xp. This migration adds the two new
-- identity columns; the streak columns already existed and are now actually
-- maintained by lib/profile.ts's recordActivity().

alter table profiles add column if not exists full_name text;
alter table profiles add column if not exists gender text check (gender in ('female', 'male', 'other') or gender is null);

comment on column profiles.full_name is 'Display name chosen at sign-up, max 8 characters (enforced in app code, not here, since trimming server-side would silently corrupt input).';
comment on column profiles.gender is 'Chosen at sign-up, used only to pick a default avatar illustration — female/male/other, nullable for pre-migration accounts.';
