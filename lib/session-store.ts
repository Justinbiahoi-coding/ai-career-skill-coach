import type { FullInterviewScoreResult, InterviewScoreResult, SelectedGap, Skill } from "./types";

const JD_KEY = "acsc:jdText";
const SKILLS_KEY = "acsc:skills";
const SELECTED_GAP_KEY = "acsc:selectedGapSkill";
const INTERVIEW_SCORE_KEY = "acsc:interviewScore";
const PRACTICED_SKILLS_KEY = "acsc:practicedSkills";
const FULL_INTERVIEW_SCORE_KEY = "acsc:fullInterviewScore";

export interface ExtractedSkillsSession {
  jdText: string;
  skills: Skill[];
}

// Next.js chuyển trang bằng cách tải lại route mới, nên state React (JD +
// skills đã trích xuất ở "/") không sống sót qua điều hướng. sessionStorage
// "mang" dữ liệu đó sang trang tiếp theo trong cùng 1 phiên tab.
export function saveExtractedSkills(session: ExtractedSkillsSession): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(JD_KEY, session.jdText);
  sessionStorage.setItem(SKILLS_KEY, JSON.stringify(session.skills));
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

// Ghi nhận 1 skill đã luyện xong (đã hoàn thành /learn + /interview cho nó).
// Dùng ở /gap để hiện tiến độ và mở khóa Full Interview khi luyện hết.
export function markSkillPracticed(skillName: string): void {
  if (typeof window === "undefined") return;
  const current = loadPracticedSkills();
  if (!current.includes(skillName)) {
    sessionStorage.setItem(PRACTICED_SKILLS_KEY, JSON.stringify([...current, skillName]));
  }
}

export function loadPracticedSkills(): string[] {
  if (typeof window === "undefined") return [];
  const raw = sessionStorage.getItem(PRACTICED_SKILLS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveFullInterviewScore(score: FullInterviewScoreResult): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(FULL_INTERVIEW_SCORE_KEY, JSON.stringify(score));
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

export function saveInterviewScore(score: InterviewScoreResult): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(INTERVIEW_SCORE_KEY, JSON.stringify(score));
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
  return next;
}
