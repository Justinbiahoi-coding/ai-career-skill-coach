export type SkillImportance = "high" | "medium" | "low";
export type SkillType = "hard" | "soft";

export interface Skill {
  name: string;
  importance: SkillImportance;
  type: SkillType;
}

export interface ExtractSkillsResult {
  skills: Skill[];
  usedFallback: boolean;
}

export interface GenerateLessonResult {
  lessonText: string;
  exercisePrompt: string;
  usedFallback: boolean;
}

export interface GradeExerciseResult {
  score: number;
  feedback: string;
  usedFallback: boolean;
}
