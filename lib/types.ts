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

export interface SelectedGap {
  skill: Skill;
  // Self-rating (1-5) the user gave this skill on /gap, kept so /result can
  // show a before/after comparison against the post-interview score.
  confidenceRating: number;
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

export interface InterviewMessage {
  role: "assistant" | "user";
  text: string;
}

export interface InterviewTurnResult {
  question: string;
  isLast: boolean;
  usedFallback: boolean;
}

export interface InterviewScoreResult {
  clarity: number;
  relevance: number;
  confidence: number;
  overallFeedback: string;
  usedFallback: boolean;
}
