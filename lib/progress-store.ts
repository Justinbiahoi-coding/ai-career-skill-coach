import { createClient } from "./supabase/client";
import type { FullInterviewScoreResult, InterviewScoreResult } from "./types";

/**
 * Fire-and-forget writes to Postgres, layered on top of the sessionStorage
 * flow in session-store.ts rather than replacing it.
 *
 * Every function here is called without awaiting its result and never throws
 * — a failed write (offline, RLS misconfigured, signed out) is swallowed so
 * it cannot break the page that triggered it. sessionStorage stays the
 * source of truth for the in-flight journey; this is purely the part that
 * needs to survive a sign-out, which sessionStorage by definition cannot do.
 *
 * No call site elsewhere in the app awaits these or checks their return
 * value — that is what makes them safe to add without touching the 21
 * existing session-store call sites across 7 pages.
 */

async function currentUserId(): Promise<string | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/** Adds XP to the signed-in user's running total. No-op if signed out. */
export async function persistXp(amount: number): Promise<void> {
  if (amount <= 0) return;
  try {
    const userId = await currentUserId();
    if (!userId) return;

    const supabase = createClient();
    // Two round trips (read then write) rather than a single atomic RPC:
    // simpler to reason about under a midnight deadline, and a lost update
    // here costs a few XP, not correctness.
    const { data: existing } = await supabase
      .from("profiles")
      .select("xp")
      .eq("id", userId)
      .maybeSingle();

    const nextXp = (existing?.xp ?? 0) + amount;
    await supabase
      .from("profiles")
      .upsert({ id: userId, xp: nextXp, updated_at: new Date().toISOString() });
  } catch {
    // Swallowed by design — see file header.
  }
}

/**
 * Records a skill as practiced for the signed-in user. No-op if signed out.
 *
 * jobId is optional: passing it records progress against a specific saved
 * job (what Mock Test's "have I practiced enough" check reads), matching
 * migration-002's per-job skill_progress. Omitting it keeps the pre-migration
 * behavior of an account-wide record with no job attached — used only where
 * a caller genuinely has no job context.
 */
export async function persistSkillPracticed(skillName: string, jobId?: string): Promise<void> {
  try {
    const userId = await currentUserId();
    if (!userId) return;

    const supabase = createClient();
    if (jobId) {
      await supabase
        .from("skill_progress")
        .upsert(
          { user_id: userId, job_id: jobId, skill_name: skillName },
          { onConflict: "user_id,job_id,skill_name" }
        );
    } else {
      await supabase.from("skill_progress").insert({ user_id: userId, skill_name: skillName });
    }
  } catch {
    // Swallowed by design — see file header.
  }
}

/** Appends one row to interview_history. No-op if signed out. jobId is optional (migration-002). */
export async function persistInterviewResult(
  kind: "single_skill",
  skillName: string,
  score: InterviewScoreResult,
  jobId?: string
): Promise<void>;
export async function persistInterviewResult(
  kind: "full",
  skillName: null,
  score: FullInterviewScoreResult,
  jobId?: string
): Promise<void>;
export async function persistInterviewResult(
  kind: "single_skill" | "full",
  skillName: string | null,
  score: InterviewScoreResult | FullInterviewScoreResult,
  jobId?: string
): Promise<void> {
  try {
    const userId = await currentUserId();
    if (!userId) return;

    const supabase = createClient();
    await supabase.from("interview_history").insert({
      user_id: userId,
      job_id: jobId ?? null,
      kind,
      skill_name: skillName,
      scores: score,
      used_fallback: score.usedFallback,
    });
  } catch {
    // Swallowed by design — see file header.
  }
}
