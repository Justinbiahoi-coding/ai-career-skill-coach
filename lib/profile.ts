import { createClient } from "./supabase/client";
import type { Gender, Profile } from "./types";
import { MAX_DISPLAY_NAME_LENGTH } from "./types";

/**
 * Data access for profiles — the display identity (name, gender, avatar
 * choice) collected at sign-up, plus the streak Duolingo-style apps live or
 * die by. Unlike lib/progress-store.ts's fire-and-forget writes, the read
 * here (getMyProfile) is awaited and its result matters to the navbar; the
 * write (recordActivity) stays fire-and-forget-safe like the rest of that
 * file, since a missed streak tick should never break the page that
 * triggered it.
 */

async function requireUserId(): Promise<string> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  return user.id;
}

function rowToProfile(row: {
  id: string;
  full_name: string | null;
  gender: string | null;
  xp: number;
  streak_days: number;
  last_active_date: string | null;
}): Profile {
  return {
    id: row.id,
    fullName: row.full_name,
    gender: row.gender as Gender | null,
    xp: row.xp,
    // Displayed, not stored, streak: the DB column only updates when
    // recordActivity() runs, so a student who broke their streak days ago
    // but hasn't practiced since would otherwise still see yesterday's
    // number until their next action. Recomputing on every read means
    // opening the app the morning after a missed day shows 0 immediately,
    // Duolingo-style, rather than waiting for a new activity to correct it.
    streakDays: effectiveStreak(row.streak_days, row.last_active_date),
    lastActiveDate: row.last_active_date,
  };
}

/** A streak survives today or yesterday's last activity; anything older reads as broken (0) until practiced again. */
function effectiveStreak(storedStreak: number, lastActiveDate: string | null): number {
  if (!lastActiveDate) return 0;
  const gap = daysBetween(lastActiveDate, todayUtc());
  return gap <= 1 ? storedStreak : 0;
}

/** The signed-in user's profile, or null if they have none yet (pre-migration accounts, or sign-up write failed). */
export async function getMyProfile(): Promise<Profile | null> {
  const userId = await requireUserId();
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, gender, xp, streak_days, last_active_date")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data ? rowToProfile(data) : null;
}

/**
 * Called once right after auth.signUp() succeeds. full_name is trimmed and
 * hard-capped here (not just in the input's maxLength) since this is the
 * only place that ever writes it — a caller bypassing the form entirely
 * (e.g. a future API) would otherwise have no length guarantee at all.
 */
export async function createProfile(
  userId: string,
  fullName: string,
  gender: Gender
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("profiles").insert({
    id: userId,
    full_name: fullName.trim().slice(0, MAX_DISPLAY_NAME_LENGTH),
    gender,
  });
  if (error) throw error;
}

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / msPerDay);
}

/**
 * Ticks the signed-in user's streak forward — call this from any real
 * practice action (XP gain, a completed card, an interview). No-op if
 * signed out, and every failure is swallowed, matching progress-store.ts's
 * fire-and-forget contract: a broken streak write must never surface as an
 * error on the page that triggered it.
 *
 * Streak math, keyed on UTC calendar dates (not exact 24h windows, so a
 * student in any timezone gets one clean "today" rather than a rolling
 * window that penalizes early-morning or late-night practice):
 *   - last_active_date is today already -> no change, already counted.
 *   - last_active_date was yesterday -> streak_days + 1 (kept the streak alive).
 *   - anything older, or never set -> streak_days resets to 1 (starting over).
 */
export async function recordActivity(): Promise<void> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: existing } = await supabase
      .from("profiles")
      .select("streak_days, last_active_date")
      .eq("id", user.id)
      .maybeSingle();

    const today = todayUtc();
    if (existing?.last_active_date === today) return;

    const gap = existing?.last_active_date ? daysBetween(existing.last_active_date, today) : null;
    const nextStreak = gap === 1 ? (existing?.streak_days ?? 0) + 1 : 1;

    await supabase.from("profiles").upsert({
      id: user.id,
      streak_days: nextStreak,
      last_active_date: today,
      updated_at: new Date().toISOString(),
    });
  } catch {
    // Swallowed by design — see file header.
  }
}
