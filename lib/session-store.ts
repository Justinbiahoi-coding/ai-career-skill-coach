import type { InterviewScoreResult, SelectedGap, Skill } from "./types";

const JD_KEY = "acsc:jdText";
const SKILLS_KEY = "acsc:skills";
const SELECTED_GAP_KEY = "acsc:selectedGapSkill";
const INTERVIEW_SCORE_KEY = "acsc:interviewScore";

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
