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
