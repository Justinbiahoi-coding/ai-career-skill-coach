import type { Skill } from "./types";

const JD_KEY = "acsc:jdText";
const SKILLS_KEY = "acsc:skills";
const SELECTED_GAP_KEY = "acsc:selectedGapSkill";

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

export function saveSelectedGap(skill: Skill): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SELECTED_GAP_KEY, JSON.stringify(skill));
}

export function loadSelectedGap(): Skill | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(SELECTED_GAP_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Skill;
  } catch {
    return null;
  }
}
