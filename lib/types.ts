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

// "TopCV" vẫn nằm trong kiểu dù KHÔNG còn được tìm kiếm trực tiếp: Cloudflare
// của họ chặn (403) cả IP datacenter lẫn IP thường sau vài chục request, và
// trang 403 nói rõ request của mình đã kích hoạt hệ thống bảo vệ — nên không
// gọi nữa. Ảnh chụp một job TopCV thật vẫn giữ trong FALLBACK_JOBS.
export type JobSource =
  | "VietnamWorks"
  | "ITviec"
  | "CareerLink"
  | "TopDev"
  | "TopCV"
  | "RemoteOK";

export interface JobListing {
  id: string;
  title: string;
  company: string;
  source: JobSource;
  /** Link tin tuyển dụng gốc, để người dùng kiểm chứng và để ghi nguồn. */
  url: string;
  /** VietnamWorks/RemoteOK trả JD ngay khi search; ITviec phải tải thêm. */
  jdText?: string;
}

export interface JobSearchResult {
  jobs: JobListing[];
  usedFallback: boolean;
}

export interface JobDescriptionResult {
  jdText: string;
  usedFallback: boolean;
}

/**
 * A job the user has saved from Find Job, the entry point Practice and Mock
 * Test both pick from. `skills` is null until Practice analyzes it — saving
 * is a plain database write, analyzing calls Gemini, and those happen at
 * different times so the user isn't paying an AI call for every job they
 * merely like the look of.
 */
export interface SavedJob {
  id: string;
  title: string;
  company: string;
  source: JobSource;
  url: string;
  jdText: string;
  skills: Skill[] | null;
  createdAt: string;
}

/** How much of a saved job's skills have been practiced — drives the Mock Test warning. */
export interface JobProgress {
  jobId: string;
  totalSkills: number;
  practicedSkills: number;
}

/** The 6 gradeable Practice Room cards counted toward a skill's % complete — "knowledge" excluded. */
export const GRADEABLE_CARD_KINDS = [
  "multiple_choice",
  "fill_blank",
  "reorder",
  "free_text",
  "mini_dialogue",
  "mixed",
] as const;

/**
 * Per-skill, per-job progress through the Practice Room's 6 gradeable cards.
 * completedCards is a subset of GRADEABLE_CARD_KINDS; a skill is "fully
 * practiced" (counts toward Mock Test readiness) once it has all 6.
 */
export interface SkillCardProgress {
  skillName: string;
  completedCards: string[];
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

// --- Multi-step practice (Duolingo-style), built on top of the lesson above ---
//
// A practice session is one lessonText followed by 5 steps, always in this
// order: easiest concept-check first, hardest (open dialogue) last. The
// first three step types have one fixed correct answer, so they're graded
// locally in the browser — no AI call, no latency, no Gemini quota spent.
// Only free_text and mini_dialogue need the model to judge an open answer.

export interface MultipleChoiceStep {
  type: "multiple_choice";
  question: string;
  options: string[];
  /** Index into options. */
  correctIndex: number;
  explanation: string;
}

export interface FillBlankStep {
  type: "fill_blank";
  /** The blank is written as ___ in the sentence. */
  sentence: string;
  correctAnswer: string;
  explanation: string;
}

export interface ReorderStep {
  type: "reorder";
  instruction: string;
  /** Already in the correct order; the UI shuffles it for display. */
  correctOrder: string[];
  explanation: string;
}

export interface FreeTextStep {
  type: "free_text";
  prompt: string;
}

export interface MiniDialogueStep {
  type: "mini_dialogue";
  /** The AI's opening question for this step. */
  openingQuestion: string;
}

export type PracticeStep =
  | MultipleChoiceStep
  | FillBlankStep
  | ReorderStep
  | FreeTextStep
  | MiniDialogueStep;

export interface GeneratePracticeResult {
  lessonText: string;
  steps: PracticeStep[];
  usedFallback: boolean;
}

// --- Practice Room: 7 selectable drill cards per skill, built on top of the
// single-lesson-plus-5-steps shape above rather than replacing it. ---
//
// Each of the 5 drill-type cards (multiple_choice, fill_blank, reorder,
// free_text, mini_dialogue) holds 4-5 items of ONE PracticeStep type; the
// "mixed" card holds ~15 items spanning all 5 types shuffled together. Both
// are fetched lazily, one Gemini call per card the student actually opens —
// generating all 7 up front would burn most of a day's ~20-request quota on
// cards nobody visits. "knowledge" is not a PracticeStep at all: it's prose
// to read, never graded, and never counted toward a skill's completion.
export type DrillStepType = PracticeStep["type"];
export type PracticeCardKind = "knowledge" | DrillStepType | "mixed";

export interface KnowledgeCardResult {
  /** Longer-form theory than lessonText — this IS the reading material, not a teaser for it. */
  articleText: string;
  usedFallback: boolean;
}

/** Response for a single-type drill card (mode = one of DrillStepType). 4-5 items of that one type. */
export interface DrillCardResult {
  items: PracticeStep[];
  usedFallback: boolean;
}

/** Response for the "mixed" card: ~15 items spanning all 5 drill types, already shuffled server-side. */
export interface MixedCardResult {
  items: PracticeStep[];
  usedFallback: boolean;
}

/** Grading result for free_text and mini_dialogue steps — the two an AI judges. */
export interface GradeStepResult {
  score: number;
  feedback: string;
  usedFallback: boolean;
}

/** One dialogue exchange, for the mini_dialogue step's short back-and-forth. */
export interface DialogueTurn {
  role: "assistant" | "user";
  text: string;
}

export interface DialogueReplyResult {
  /** The AI's next line — a follow-up question, or its closing remark if isLast. */
  reply: string;
  isLast: boolean;
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

export interface FullInterviewTurnResult {
  question: string;
  isLast: boolean;
  usedFallback: boolean;
}

export interface FullInterviewScoreResult {
  overallReadiness: number;
  strengths: string;
  gaps: string;
  overallFeedback: string;
  usedFallback: boolean;
}
