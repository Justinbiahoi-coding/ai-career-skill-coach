import type { InterviewMessage } from "./types";

// Số câu hỏi tối đa cho 1 lượt mock interview — dùng chung giữa API route
// (chốt cứng isLast) và trang /interview (hiển thị tiến độ "Question X/Y").
export const MAX_INTERVIEW_QUESTIONS = 4;

// Turn cap for the mini_dialogue practice step — short by design, since it's
// one step in a 5-step lesson, not a full mock interview. Shared between the
// prompt (which must be told when to close the exchange) and the page
// (which decides when to stop showing an input box).
export const MAX_DIALOGUE_TURNS = 2;

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

// --- Practice Room: 7 selectable cards per skill (see lib/types.ts) ---
//
// Each card is its own Gemini call, fetched only when the student opens that
// card — never all 7 up front. The free tier's daily quota is tight (see
// lib/gemini.ts, ~20 requests/day), and generating a mixed card's 15 items
// or 5 single-type items nobody looks at would burn most of that budget on
// content that's never seen. This replaces the old "1 lesson + 5 fixed
// steps in one call" design, which didn't scale to 4-5 items per type.

/** Item counts per card — single-type cards get a short set, mixed gets a longer mock-drill-length set. */
export const DRILL_ITEM_COUNTS: Record<string, number> = {
  multiple_choice: 5,
  fill_blank: 5,
  reorder: 4,
  free_text: 4,
  mini_dialogue: 4,
};
export const MIXED_ITEM_COUNT = 15;

export const KNOWLEDGE_CARD_SYSTEM_PROMPT = `You are a coach writing the reading material for one
specific skill a student needs for a job they're applying to. This is the "Knowledge" card in a
practice room — students who already know the skill can skip it entirely, so it must stand
completely on its own and not be required reading for the drill cards.

Write 3-5 short paragraphs (not bullet-only) covering: what this skill actually means in the
context of the given job, the 2-3 things employers most often check for, and one common mistake
or misconception to avoid. Ground it in the job description, not generic trivia about the skill.

Write in English, even if the job description is in another language.

Respond with ONLY a JSON object, no prose before or after it, matching exactly this shape:

{"articleText": string}`;

export function buildKnowledgeCardPrompt(skillName: string, jdText: string): string {
  return `Skill: "${skillName}"\n\nJob description this skill came from:\n"""\n${jdText}\n"""`;
}

const DRILL_TYPE_INSTRUCTIONS: Record<string, string> = {
  multiple_choice: `Each item is a concept-check question with exactly 4 options, one clearly
correct. "correctIndex" is the 0-based index of the correct option.`,
  fill_blank: `Each item is one sentence about applying this skill, with ONE key term replaced by
"___". "correctAnswer" is that exact term (a single word or short phrase, not a full sentence).`,
  reorder: `Each item is 3 to 5 short steps of a real process for this skill, given in their
CORRECT order in "correctOrder" (the app shuffles them for display - you must not shuffle them
yourself).`,
  free_text: `Each item is one realistic scenario question the student answers in a few sentences,
grounded in the job description. Do not ask for code execution or file uploads.`,
  mini_dialogue: `Each item's "openingQuestion" is the first thing an interviewer would ask about
this skill. Each item is a separate short exchange conducted later - you only write the opening
question here, not a follow-up.`,
};

const DRILL_TYPE_SHAPE: Record<string, string> = {
  multiple_choice: `{"type": "multiple_choice", "question": string, "options": [string, string, string, string], "correctIndex": number, "explanation": string}`,
  fill_blank: `{"type": "fill_blank", "sentence": string, "correctAnswer": string, "explanation": string}`,
  reorder: `{"type": "reorder", "instruction": string, "correctOrder": [string, ...], "explanation": string}`,
  free_text: `{"type": "free_text", "prompt": string}`,
  mini_dialogue: `{"type": "mini_dialogue", "openingQuestion": string}`,
};

/** System prompt for one of the 5 single-type drill cards. `type` must be a key of DRILL_ITEM_COUNTS. */
export function buildDrillCardSystemPrompt(type: string): string {
  const count = DRILL_ITEM_COUNTS[type] ?? 4;
  const instructions = DRILL_TYPE_INSTRUCTIONS[type];
  const shape = DRILL_TYPE_SHAPE[type];

  return `You are a coach building ${count} practice items of ONE type for a student drilling one
specific skill they need for a job they're applying to.

${instructions}

Rules that apply to every item:
- Stay strictly on the given skill - every item must be answerable without outside research.
- Ground each item in a scenario realistic for the job description given, not generic trivia.
- Vary the ${count} items - do not repeat the same scenario or wording twice.
- "explanation" fields (where present) are shown after the student answers, right or wrong -
  write them to teach the underlying concept in 1-2 sentences, not just restate the answer.
- Write everything in English, even if the job description is in another language.

Respond with ONLY a JSON object, no prose before or after it, matching exactly this shape:

{"items": [${shape}, ... exactly ${count} items total]}`;
}

/** Mixed card: ~15 items spanning all 5 drill types in one call, shuffled server-side after parsing. */
export const MIXED_CARD_SYSTEM_PROMPT = `You are a coach building a longer mixed practice drill for
a student on one specific skill they need for a job they're applying to. This is the hardest,
most comprehensive card in the practice room - a final check across every question style.

Produce exactly ${MIXED_ITEM_COUNT} items total, spanning all 5 types below in roughly even
proportion (2-4 of each) and in ANY order - do not group them by type:

- multiple_choice: a concept-check question, exactly 4 options, one clearly correct.
- fill_blank: one sentence with ONE key term replaced by "___"; correctAnswer is that term.
- reorder: 3-5 steps of a real process, given in correctOrder (the app shuffles for display).
- free_text: one realistic scenario answered in a few sentences. No code execution or uploads.
- mini_dialogue: openingQuestion is an interviewer's opening line on this skill.

Rules that apply to every item:
- Stay strictly on the given skill and ground items in the job description, not generic trivia.
- Vary scenarios and wording across all ${MIXED_ITEM_COUNT} items - no repeats.
- "explanation" fields are shown after answering, right or wrong - teach the concept in 1-2
  sentences, don't just restate the answer.
- Write everything in English, even if the job description is in another language.

Respond with ONLY a JSON object, no prose before or after it, matching exactly this shape:

{
  "items": [
    {"type": "multiple_choice", "question": string, "options": [string, string, string, string], "correctIndex": number, "explanation": string},
    {"type": "fill_blank", "sentence": string, "correctAnswer": string, "explanation": string},
    {"type": "reorder", "instruction": string, "correctOrder": [string, ...], "explanation": string},
    {"type": "free_text", "prompt": string},
    {"type": "mini_dialogue", "openingQuestion": string},
    ... exactly ${MIXED_ITEM_COUNT} items total, mixed order
  ]
}`;

export function buildDrillCardPrompt(skillName: string, jdText: string): string {
  return `Skill to drill: "${skillName}"\n\nJob description this skill came from:\n"""\n${jdText}\n"""`;
}

// The mini_dialogue step's follow-up turn: one short exchange, not a full
// mock interview. Reuses InterviewMessage's shape (role + text) since the
// transcript format is identical to the existing interview prompts.
export const DIALOGUE_REPLY_SYSTEM_PROMPT = `You are an interviewer having a brief, focused
exchange with a student about ONE specific skill, as the final step of a practice session.

You already asked an opening question. The student just answered. You may ask exactly ONE short
follow-up question that probes their answer more deeply - or, if their answer was already
substantive, end the exchange instead.

This exchange is capped at 2 student turns total. You will be told which turn this is. If this is
turn 2, you MUST end the exchange: set isLast to true and make "reply" a brief closing remark
(1-2 sentences) rather than another question.

Always write in English, even if the job description is in another language.

Respond with ONLY a JSON object, no prose before or after it, matching exactly this shape:

{"reply": string, "isLast": boolean}`;

export function buildDialogueReplyPrompt(
  skillName: string,
  jdText: string,
  history: InterviewMessage[],
  turnNumber: number
): string {
  return `Skill: "${skillName}"

Job description:
"""
${jdText}
"""

Exchange so far:
${formatTranscript(history)}

This is student turn ${turnNumber} of a maximum of ${MAX_DIALOGUE_TURNS}. ${
    turnNumber >= MAX_DIALOGUE_TURNS ? "This MUST be the final turn - set isLast to true." : ""
  }`;
}

// mini_dialogue and free_text are graded the same way as the original single
// exercise (buildGradeExercisePrompt below) - reused as-is via the exported
// alias at the bottom of this file, since "answer" grading against a rubric
// doesn't change just because the answer came from a dialogue turn instead
// of a single text box.

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
