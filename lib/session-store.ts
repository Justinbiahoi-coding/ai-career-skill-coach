import { markCardCompleted } from "./saved-jobs";
import { persistInterviewResult, persistSkillPracticed, persistXp } from "./progress-store";
import { GRADEABLE_CARD_KINDS } from "./types";
import type { FullInterviewScoreResult, InterviewScoreResult, SelectedGap, Skill } from "./types";

const JD_KEY = "acsc:jdText";
const SKILLS_KEY = "acsc:skills";
const JOB_ID_KEY = "acsc:activeJobId";
const SELECTED_GAP_KEY = "acsc:selectedGapSkill";
const INTERVIEW_SCORE_KEY = "acsc:interviewScore";
const FULL_INTERVIEW_SCORE_KEY = "acsc:fullInterviewScore";
// Prefix, not a single key: one entry per skill name, since several skills
// in the same job can each be mid-practice at once (e.g. "SQL:2" and
// "Communication:1" both exist in sessionStorage at the same time).
const CARD_PROGRESS_PREFIX = "acsc:cardProgress:";

export interface ExtractedSkillsSession {
  jdText: string;
  skills: Skill[];
}

// Next.js chuyển trang bằng cách tải lại route mới, nên state React (JD +
// skills đã trích xuất ở "/gap") không sống sót qua điều hướng. sessionStorage
// "mang" dữ liệu đó sang trang tiếp theo trong cùng 1 phiên tab.
//
// jobId là optional: một job đã lưu (từ Find Job) mang theo jobId để
// markSkillPracticed/saveInterviewScore ghi đúng saved_jobs.id; một JD dán
// trực tiếp trong Practice (không qua danh sách đã lưu) thì không có jobId,
// tiến trình của nó vẫn được ghi nhưng không gắn với job cụ thể nào — đúng ý
// "AI cũng analyze chứ không cần analyze mỗi job".
export function saveExtractedSkills(session: ExtractedSkillsSession, jobId?: string | null): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(JD_KEY, session.jdText);
  sessionStorage.setItem(SKILLS_KEY, JSON.stringify(session.skills));
  if (jobId) {
    sessionStorage.setItem(JOB_ID_KEY, jobId);
  } else {
    sessionStorage.removeItem(JOB_ID_KEY);
  }
}

export function loadExtractedSkills(): ExtractedSkillsSession | null {
  if (typeof window === "undefined") return null;
  const jdText = sessionStorage.getItem(JD_KEY);
  const skillsRaw = sessionStorage.getItem(SKILLS_KEY);
  if (!jdText || !skillsRaw) return null;
  try {
    const skills = JSON.parse(skillsRaw) as Skill[];
    return { jdText, skills };
  } catch {
    return null;
  }
}

/** The saved job (if any) the current practice/interview session is tied to. */
export function loadActiveJobId(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(JOB_ID_KEY);
}

export function saveSelectedGap(selectedGap: SelectedGap): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SELECTED_GAP_KEY, JSON.stringify(selectedGap));
}

export function loadSelectedGap(): SelectedGap | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(SELECTED_GAP_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SelectedGap;
  } catch {
    return null;
  }
}

/**
 * Marks one Practice Room card (a DrillStepType or "mixed" — never
 * "knowledge", which isn't graded) as completed for one skill.
 *
 * Two destinations depending on whether this session has a saved job:
 * - With a jobId (a job picked from Find Job), the DB is the source of
 *   truth via markCardCompleted — it needs to survive closing the tab, and
 *   /gap's overview screen reads it back with listSkillCardProgressForJob.
 * - Without one (a JD pasted directly, never saved), there's no job row to
 *   attach progress to, so it lives in sessionStorage only and disappears
 *   with the tab — matching the "pasted JD is a quick look, not a saved
 *   thing" decision that shaped Find Job/Practice's split in the first
 *   place.
 *
 * Callers don't need to know which path is active — /learn and its 7 card
 * routes call this and loadCompletedCardsForSkill the same way either way.
 */
export function markCardCompletedForSkill(skillName: string, cardKind: string): void {
  if (typeof window === "undefined") return;
  const jobId = loadActiveJobId();

  // Finishing a card either way is real practice activity — persisted
  // account-wide (not gated on having a jobId) since even a pasted-JD
  // session that never gets saved is still genuine practice.
  void persistSkillPracticed(skillName, jobId ?? undefined);

  if (jobId) {
    // Fire-and-forget-ish: awaited internally so a failure can be logged,
    // but callers don't block on it — the UI already shows the card as
    // done optimistically via its own local "just finished" state.
    void markCardCompleted(jobId, skillName, cardKind).catch(() => {});
    return;
  }

  const key = CARD_PROGRESS_PREFIX + skillName;
  const current = loadCompletedCardsForSkill(skillName);
  if (!current.includes(cardKind)) {
    sessionStorage.setItem(key, JSON.stringify([...current, cardKind]));
  }
}

/**
 * Session-local fallback read for the no-jobId path above. Pages that have a
 * jobId should prefer listSkillCardProgressForJob (the DB) instead — this
 * only ever reflects a pasted JD's progress within the current tab.
 */
export function loadCompletedCardsForSkill(skillName: string): string[] {
  if (typeof window === "undefined") return [];
  const raw = sessionStorage.getItem(CARD_PROGRESS_PREFIX + skillName);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((k) => GRADEABLE_CARD_KINDS.includes(k)) : [];
  } catch {
    return [];
  }
}

export function saveFullInterviewScore(score: FullInterviewScoreResult): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(FULL_INTERVIEW_SCORE_KEY, JSON.stringify(score));
  void persistInterviewResult("full", null, score, loadActiveJobId() ?? undefined);
}

export function loadFullInterviewScore(): FullInterviewScoreResult | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(FULL_INTERVIEW_SCORE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as FullInterviewScoreResult;
  } catch {
    return null;
  }
}

// skillName is optional and additive: the one existing call site didn't pass
// it before, so making it required would be a breaking change for no reason.
export function saveInterviewScore(score: InterviewScoreResult, skillName?: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(INTERVIEW_SCORE_KEY, JSON.stringify(score));
  if (skillName) {
    void persistInterviewResult("single_skill", skillName, score, loadActiveJobId() ?? undefined);
  }
}

export function loadInterviewScore(): InterviewScoreResult | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(INTERVIEW_SCORE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as InterviewScoreResult;
  } catch {
    return null;
  }
}

const XP_KEY = "acsc:xp";

// XP tổng của phiên. Hiện được cộng ở các mốc lớn (chấm bài, xong phỏng vấn);
// khi phần practice tương tác được làm chi tiết, mỗi bước đúng sẽ cộng tiếp
// vào đây mà không phải đổi chỗ nào khác.
export function loadXp(): number {
  if (typeof window === "undefined") return 0;
  const raw = sessionStorage.getItem(XP_KEY);
  const parsed = raw ? Number.parseInt(raw, 10) : 0;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export function addXp(amount: number): number {
  if (typeof window === "undefined" || amount <= 0) return 0;
  const next = loadXp() + amount;
  sessionStorage.setItem(XP_KEY, String(next));
  void persistXp(amount);
  return next;
}
