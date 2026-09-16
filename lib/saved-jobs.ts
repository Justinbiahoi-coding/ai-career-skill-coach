import { createClient } from "./supabase/client";
import { GRADEABLE_CARD_KINDS } from "./types";
import type { JobListing, JobProgress, SavedJob, Skill, SkillCardProgress } from "./types";

/**
 * Data access for saved_jobs — the entry point Find Job writes to and
 * Practice/Mock Test both read from.
 *
 * Unlike progress-store.ts (fire-and-forget XP/history writes that must
 * never block or fail visibly), every function here is awaited by its
 * caller and its result matters: Practice can't show a job list without
 * actually getting one back. Callers are responsible for their own loading
 * state and error handling — these just do the query and throw or return.
 *
 * All reads/writes require a signed-in user; every function throws
 * "Not signed in" rather than silently returning empty, so a caller can't
 * mistake "nobody's logged in" for "you have no saved jobs".
 */

async function requireUserId(): Promise<string> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  return user.id;
}

function rowToSavedJob(row: {
  id: string;
  title: string | null;
  company: string | null;
  source: string | null;
  url: string | null;
  jd_text: string;
  skills: Skill[] | null;
  created_at: string;
}): SavedJob {
  return {
    id: row.id,
    title: row.title ?? "Untitled role",
    company: row.company ?? "Unknown company",
    // Cast rather than validate against JobSource's union: this value only
    // ever came from our own insert (saveJob below), never from user input.
    source: (row.source ?? "VietnamWorks") as SavedJob["source"],
    url: row.url ?? "",
    jdText: row.jd_text,
    skills: row.skills,
    createdAt: row.created_at,
  };
}

/**
 * Saves a job from a search result or a pasted JD. No AI call — this is the
 * "like" action in Find Job, cheap enough to do for every job someone might
 * want to come back to.
 */
export async function saveJob(job: Pick<JobListing, "title" | "company" | "source" | "url"> & {
  jdText: string;
}): Promise<SavedJob> {
  const userId = await requireUserId();
  const supabase = createClient();
  const { data, error } = await supabase
    .from("saved_jobs")
    .insert({
      user_id: userId,
      title: job.title,
      company: job.company,
      source: job.source,
      url: job.url,
      jd_text: job.jdText,
      skills: null,
    })
    .select()
    .single();

  if (error) throw error;
  return rowToSavedJob(data);
}

export async function unsaveJob(jobId: string): Promise<void> {
  const userId = await requireUserId();
  const supabase = createClient();
  const { error } = await supabase.from("saved_jobs").delete().eq("id", jobId).eq("user_id", userId);
  if (error) throw error;
}

/** All jobs the signed-in user has saved, most recently saved first. */
export async function listSavedJobs(): Promise<SavedJob[]> {
  const userId = await requireUserId();
  const supabase = createClient();
  const { data, error } = await supabase
    .from("saved_jobs")
    .select()
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(rowToSavedJob);
}

export async function getSavedJob(jobId: string): Promise<SavedJob | null> {
  const userId = await requireUserId();
  const supabase = createClient();
  const { data, error } = await supabase
    .from("saved_jobs")
    .select()
    .eq("id", jobId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data ? rowToSavedJob(data) : null;
}

/** Called once Practice has run extract-skills on a saved job's JD. */
export async function updateJobSkills(jobId: string, skills: Skill[]): Promise<void> {
  const userId = await requireUserId();
  const supabase = createClient();
  const { error } = await supabase
    .from("saved_jobs")
    .update({ skills })
    .eq("id", jobId)
    .eq("user_id", userId);
  if (error) throw error;
}

/**
 * How many of a job's skills have been FULLY practiced (all 6 gradeable
 * Practice Room cards done), for the Mock Test warning ("you've only fully
 * practiced 2 of 5 skills for this job — continue anyway?"). A skill with 1
 * of 6 cards done does not count yet — partial practice is real progress,
 * shown on /gap as a %, but Mock Test cares about "ready", not "started".
 * totalSkills comes from the caller (the job's own skills array) rather than
 * a second query, since the caller already has the job loaded.
 */
export async function getJobProgress(jobId: string, totalSkills: number): Promise<JobProgress> {
  const rows = await listSkillCardProgressForJob(jobId);
  const practicedSkills = rows.filter(
    (r) => r.completedCards.length >= GRADEABLE_CARD_KINDS.length
  ).length;
  return { jobId, totalSkills, practicedSkills };
}

/** Which skill names have been FULLY practiced (all 6 cards) for this specific job. */
export async function listPracticedSkillsForJob(jobId: string): Promise<string[]> {
  const rows = await listSkillCardProgressForJob(jobId);
  return rows
    .filter((r) => r.completedCards.length >= GRADEABLE_CARD_KINDS.length)
    .map((r) => r.skillName);
}

/** Per-card completion for every skill of one job — the data /gap's skill list reads to show % complete. */
export async function listSkillCardProgressForJob(jobId: string): Promise<SkillCardProgress[]> {
  const userId = await requireUserId();
  const supabase = createClient();
  const { data, error } = await supabase
    .from("skill_progress")
    .select("skill_name, completed_cards")
    .eq("user_id", userId)
    .eq("job_id", jobId);

  if (error) throw error;
  return (data ?? []).map((row) => ({
    skillName: row.skill_name as string,
    completedCards: (row.completed_cards as string[] | null) ?? [],
  }));
}

/**
 * Marks one Practice Room card as completed for a skill, merging into
 * whatever cards were already done rather than overwriting them — finishing
 * fill_blank today shouldn't erase that multiple_choice was finished
 * yesterday. Upserts on (user_id, job_id, skill_name), the same key
 * persistSkillPracticed already uses, so this and the fire-and-forget XP
 * write in progress-store.ts target the same row without racing on schema.
 */
export async function markCardCompleted(
  jobId: string,
  skillName: string,
  cardKind: string
): Promise<SkillCardProgress> {
  const userId = await requireUserId();
  const supabase = createClient();

  const { data: existing, error: readError } = await supabase
    .from("skill_progress")
    .select("completed_cards")
    .eq("user_id", userId)
    .eq("job_id", jobId)
    .eq("skill_name", skillName)
    .maybeSingle();
  if (readError) throw readError;

  const current = ((existing?.completed_cards as string[] | null) ?? []);
  const next = current.includes(cardKind) ? current : [...current, cardKind];

  const { error: writeError } = await supabase
    .from("skill_progress")
    .upsert(
      { user_id: userId, job_id: jobId, skill_name: skillName, completed_cards: next },
      { onConflict: "user_id,job_id,skill_name" }
    );
  if (writeError) throw writeError;

  return { skillName, completedCards: next };
}
