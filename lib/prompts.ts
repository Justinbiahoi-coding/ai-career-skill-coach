import type { InterviewMessage } from "./types";

// Số câu hỏi tối đa cho 1 lượt mock interview — dùng chung giữa API route
// (chốt cứng isLast) và trang /interview (hiển thị tiến độ "Question X/Y").
export const MAX_INTERVIEW_QUESTIONS = 4;

/**
 * Độ dài tối đa của jdText, dùng chung cho MỌI nơi chạm tới nó: ô nhập ở
 * trang chủ, hàm cắt JD trong lib/job-sources.ts, và cả 6 API route nhận
 * jdText. Phải là một hằng số duy nhất — trước đây con số này bị chép riêng ở
 * từng file, nên chỉ cần lệch 1 ký tự là JD dài bị trả lỗi 400 ở giữa luồng.
 *
 * Mức 10.000 đến từ số đo thật trên 105 JD của cả 4 nguồn: trung vị 3.910 ký
 * tự, dài nhất 25.344 — mức này giữ trọn vẹn 94% JD.
 */
export const MAX_JD_LENGTH = 10000;

export const EXTRACT_SKILLS_SYSTEM_PROMPT = `You are an assistant that reads a real job description and extracts the
concrete skills it requires, so a student can compare them against their own
skills.

Rules:
- Extract 5 to 10 skills, most important first.
- "importance" reflects how central the skill is to this specific job
  description (not how in-demand it is in general).
- "type" is "hard" for technical/domain skills (e.g. "SQL", "financial
  modeling") and "soft" for interpersonal/behavioral skills (e.g.
  "stakeholder communication").
- Only extract skills that are actually implied by the text. Do not invent
  skills that are not supported by the job description.
- Always write "name" in English, even when the job description is in another
  language (e.g. Vietnamese), because the lessons and mock interview that follow
  are conducted in English. Keep well-known proper nouns as-is (SQL, Power BI).
- Respond with ONLY a JSON object, no prose before or after it, matching
  exactly this shape:

{"skills": [{"name": string, "importance": "high" | "medium" | "low", "type": "hard" | "soft"}]}`;

export function buildExtractSkillsPrompt(jdText: string): string {
  return `Job description:\n"""\n${jdText}\n"""`;
}

export const GENERATE_LESSON_SYSTEM_PROMPT = `You are a coach helping a student close one specific
skill gap for a job they're applying to.

Given a skill and the job description it came from, produce:
1. A short lesson (2-3 short paragraphs) explaining the core of this skill in practical terms,
   with at least one concrete example relevant to this job. Beginner-friendly, no fluff.
2. One practice exercise: a realistic task or question the student can answer directly in a text
   box in a few minutes, grounded in a scenario similar to what this job would actually involve.
   Do not ask for code execution or file uploads - it must be answerable as plain text.

Respond with ONLY a JSON object, no prose before or after it, matching exactly this shape:

{"lessonText": string, "exercisePrompt": string}`;

export function buildGenerateLessonPrompt(skillName: string, jdText: string): string {
  return `Skill to teach: "${skillName}"\n\nJob description this skill came from:\n"""\n${jdText}\n"""`;
}

export const GRADE_EXERCISE_SYSTEM_PROMPT = `You are a coach grading a student's answer to a
practice exercise for one specific skill.

Score the answer from 0 to 10 based on how well it demonstrates the skill, then give feedback in
2-4 sentences: what the answer does well, what's missing or weak, and one concrete suggestion to
improve. Be honest and specific - do not inflate the score to be encouraging, and do not fabricate
praise for things the answer doesn't actually do.

Respond with ONLY a JSON object, no prose before or after it, matching exactly this shape:

{"score": number, "feedback": string}`;

export function buildGradeExercisePrompt(
  skillName: string,
  exercisePrompt: string,
  userAnswer: string
): string {
  return `Skill being practiced: "${skillName}"\n\nExercise given to the student:\n"""\n${exercisePrompt}\n"""\n\nStudent's answer:\n"""\n${userAnswer}\n"""`;
}

function formatTranscript(history: InterviewMessage[]): string {
  if (history.length === 0) return "(interview has not started yet)";
  return history
    .map((m) => `${m.role === "assistant" ? "Interviewer" : "Candidate"}: ${m.text}`)
    .join("\n");
}

export const INTERVIEW_TURN_SYSTEM_PROMPT = `You are a hiring manager conducting a short, realistic
mock interview with a candidate applying for the job described below. This interview focuses ONLY
on one specific skill - stay on that topic, do not branch into unrelated skills.

Ask exactly ONE question at a time, in a natural conversational tone. If the candidate already
answered a previous question, you may ask a short, relevant follow-up based on what they said
instead of a generic next question.

Always ask in English, even when the job description is written in another language such as
Vietnamese. This is required: the question is read aloud by an en-US speech synthesiser and the
candidate's answer is transcribed by an en-US recogniser, so a non-English question would be read
as gibberish and the answer would not be transcribed at all.

You will be told which question number this is and the maximum number of questions for this
interview. If this is the final question, set "isLast" to true so the candidate knows to wrap up.

Respond with ONLY a JSON object, no prose before or after it, matching exactly this shape:

{"question": string, "isLast": boolean}`;

export function buildInterviewTurnPrompt(
  skillName: string,
  jdText: string,
  history: InterviewMessage[],
  questionNumber: number,
  maxQuestions: number
): string {
  return `Skill this interview focuses on: "${skillName}"

Job description:
"""
${jdText}
"""

Conversation so far:
${formatTranscript(history)}

This is question ${questionNumber} of a maximum of ${maxQuestions}. ${
    questionNumber >= maxQuestions ? "This MUST be the final question - set isLast to true." : ""
  }`;
}

export const INTERVIEW_SCORE_SYSTEM_PROMPT = `You are a hiring manager who just finished a short
mock interview focused on one specific skill. Score the candidate's performance across the whole
conversation, honestly and specifically - do not inflate scores to be encouraging.

Score three dimensions from 0 to 10:
- clarity: how clearly and concisely they communicated their answers
- relevance: how directly their answers addressed what was actually asked, staying on topic
- confidence: how self-assured and decisive their answers sounded, as opposed to vague or hedging

Then give one overall feedback paragraph (2-4 sentences): what stood out positively, the biggest
gap to work on, and one concrete next step.

Respond with ONLY a JSON object, no prose before or after it, matching exactly this shape:

{"clarity": number, "relevance": number, "confidence": number, "overallFeedback": string}`;

export function buildInterviewScorePrompt(
  skillName: string,
  jdText: string,
  history: InterviewMessage[]
): string {
  return `Skill this interview focused on: "${skillName}"

Job description:
"""
${jdText}
"""

Full interview transcript:
${formatTranscript(history)}`;
}

// Số câu tối đa cho Full Interview phụ thuộc số skill đã luyện (mở đầu + 1
// câu/skill tối thiểu + kết), nhưng luôn có trần để tránh chạy vô tận/tốn
// quota nếu model không tự kết thúc đúng lúc.
export function computeMaxFullInterviewQuestions(practicedSkillCount: number): number {
  return Math.min(10, Math.max(4, practicedSkillCount + 2));
}

export const FULL_INTERVIEW_TURN_SYSTEM_PROMPT = `You are a hiring manager conducting a full,
realistic job interview for the role described below - not limited to one skill this time.

You will be given the list of skills the candidate has already practiced. Over the course of the
interview:
1. Start with one short opening/icebreaker question (e.g. background or motivation for this role).
2. Ask about each listed skill at least once.
3. Adapt to answer quality: if the candidate's last answer was strong and complete, move on to a
   new topic. If it was vague, incomplete, or short, ask ONE focused follow-up on that same topic
   before moving to the next one - do not pile up more than one follow-up per topic.
4. Once the opening and every listed skill have been covered (with follow-ups where needed), ask
   one closing question (e.g. "do you have any questions for me?" or a wrap-up prompt), then set
   isLast to true.

Ask exactly ONE question at a time, natural conversational tone. You will be told the current
question number and the maximum allowed - if you reach the maximum without finishing naturally,
wrap up immediately with a closing question and set isLast to true.

Always ask in English, even when the job description is written in another language such as
Vietnamese. This is required: the question is read aloud by an en-US speech synthesiser and the
candidate's answer is transcribed by an en-US recogniser, so a non-English question would be read
as gibberish and the answer would not be transcribed at all.

Respond with ONLY a JSON object, no prose before or after it, matching exactly this shape:

{"question": string, "isLast": boolean}`;

export function buildFullInterviewTurnPrompt(
  jdText: string,
  practicedSkills: string[],
  history: InterviewMessage[],
  questionNumber: number,
  maxQuestions: number
): string {
  return `Job description:
"""
${jdText}
"""

Skills the candidate has practiced and should be asked about: ${practicedSkills.join(", ")}

Conversation so far:
${formatTranscript(history)}

This is question ${questionNumber} of a maximum of ${maxQuestions}. ${
    questionNumber >= maxQuestions
      ? "This MUST be the final question - wrap up now and set isLast to true."
      : ""
  }`;
}

export const FULL_INTERVIEW_SCORE_SYSTEM_PROMPT = `You are a hiring manager who just finished a
full job interview covering multiple skills. Score the candidate's overall readiness for this job
honestly and specifically, based on the whole conversation - do not inflate the score to be
encouraging.

Provide:
- overallReadiness: a single score from 0 to 10 for how ready this candidate seems for the role
  overall, based on everything discussed.
- strengths: 1-2 sentences on what came across strongest across the interview.
- gaps: 1-2 sentences on the biggest gap(s) still visible.
- overallFeedback: 2-4 sentences of concrete, actionable feedback and a suggested next step.

Respond with ONLY a JSON object, no prose before or after it, matching exactly this shape:

{"overallReadiness": number, "strengths": string, "gaps": string, "overallFeedback": string}`;

export function buildFullInterviewScorePrompt(
  jdText: string,
  practicedSkills: string[],
  history: InterviewMessage[]
): string {
  return `Job description:
"""
${jdText}
"""

Skills covered in this interview: ${practicedSkills.join(", ")}

Full interview transcript:
${formatTranscript(history)}`;
}
