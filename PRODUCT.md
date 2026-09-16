# AI Career Skill Coach — Product Summary

**Global Hackathon 2026** · FPT University HCMC Campus, 15–17 September 2026
**Team 15** · **Track 1 — Future Skills Readiness**

- **Live prototype:** https://ai-career-skill-coach.vercel.app
- **Source:** https://github.com/Justinbiahoi-coding/ai-career-skill-coach

---

## 1. What it is

A student searches a job that a real company is hiring for right now. The AI reads that job
posting, names the skills it actually requires, and asks the student how confident they feel about
each one. It then picks the single biggest gap, teaches it, sets an exercise, grades the answer,
and finally interviews the student on that skill by voice — the way a hiring manager would.

The point is the **closed loop**. Most tools stop at advice. This one goes all the way from
*"here is a real job"* to *"here is how you actually performed when asked about it out loud."*

## 2. The challenge, and how this answers it

> *How can AI help students identify, develop, and practice the skills they need to be ready for
> the future of learning and work in the AI era?*

The brief requires a solution to demonstrate three things. Each maps to a screen the student
actually uses:

| The brief asks for | Where it happens |
|---|---|
| Better learning and career decisions | Skill gap screen — real JD skills vs. honest self-rating, with one priority named |
| Building relevant skills | Lesson + exercise generated from that specific job, graded with concrete feedback |
| Practising them meaningfully | Voice mock interview on that skill, then a full end-to-end interview |

The third is the one most solutions skip. Practice here is not a quiz — the student speaks answers
aloud, under time pressure, to an interviewer that follows up on what they just said.

## 3. Who it is for

A university student in Vietnam who is about to apply for a job or internship, has a rough idea of
the role they want, and cannot tell which of their skills are actually short of what employers ask
for.

Design consequences of that choice:

- **No account, no install.** Everything runs in one browser session. A student can open the link
  and finish a full loop without signing up.
- **Real Vietnamese jobs, not textbook examples.** The student practises against postings from
  companies they recognise.
- **Answers in English.** Interview questions, skills and lessons are always in English even when
  the job posting is in Vietnamese, because that is the language most graduate interviews at these
  companies are conducted in — and because the speech engine is `en-US`.

## 4. The core loop

```
   Search a real job  ──►  Rate your skills  ──►  Learn + practise  ──►  Mock interview  ──►  Result
        (/)                    (/gap)               (/learn)            (/interview)      (/result)
         │                        │                                                            │
         │                        └──────────── practise every skill ────────────────►  Full Interview
         │                                                                             (/interview/full)
   VietnamWorks · ITviec · RemoteOK                                                             │
   or paste your own JD                                                                  (/result/full)
```

1. **Find a real job** — search live postings by keyword, or paste any job description. Tappable
   role suggestions (accent-insensitive: typing `ke toan` finds *Kế toán*) help students who don't
   know what to type.
2. **See the gap** — the AI extracts 5–10 required skills with an importance and hard/soft label.
   The student rates their own confidence 1–5. The system names one priority gap, and the student
   can override that choice.
3. **Learn and practise** — a short lesson grounded in that specific job, plus one realistic
   exercise. The answer is graded 0–10 with specific feedback, not praise.
4. **Mock interview** — a 4-question interview on that one skill. Hands-free by default: the
   question is read aloud, the mic opens automatically, and saying *"I'm done"* ends the turn.
5. **Result** — the student's own confidence rating shown against their measured interview
   performance.
6. **Full Interview** — unlocks only after every skill from the job has been practised. A complete
   end-to-end interview covering all of them, its length adapting to answer quality (4–10
   questions), ending in an overall readiness score with strengths and remaining gaps.

## 5. AI Logic Flow

```
USER INPUT          →  DATA / CONTEXT        →  PROMPT / MODEL        →  AI OUTPUT         →  HUMAN REVIEW
─────────────────      ──────────────────       ──────────────────       ─────────────       ──────────────
Job search keyword     Live job posting         gemini-3.5-flash-lite    Required skills     Student rates each
or pasted JD           (up to 10,000 chars)     + JSON schema            + importance        skill, can override
                                                                                             the chosen priority

Self-rating 1–5        JD + chosen skill        Coaching prompt          Lesson + exercise   Student writes a real
                                                                                             answer in their words

Written answer         JD + skill + exercise    Grading prompt           Score 0–10          Student reads the
                                                                         + feedback          critique and retries

Spoken answer          Full transcript so far   Interviewer prompt       Next question       Student can replay,
                       + skill + JD             (one turn at a time)                         retype, or cancel a
                                                                                             mis-heard answer

Whole interview        Full transcript          Scoring prompt           Readiness scores    Student compares it
                                                                         + feedback          against their own
                                                                                             self-rating
```

Every stage ends with a human decision. The AI never advances the student on its own.

## 6. What the AI actually does

Seven independent calls, each one request and one response — not a single chat agent holding
state. Each call receives exactly the context it needs and returns strict JSON:

| Endpoint | Job |
|---|---|
| `/api/extract-skills` | Read a job posting → 5–10 skills with importance and hard/soft type |
| `/api/generate-lesson` | Teach one skill in the context of that job + set an exercise |
| `/api/grade-exercise` | Score the student's answer 0–10 with honest, specific feedback |
| `/api/interview-turn` | Ask the next interview question, following up on the last answer |
| `/api/interview-score` | Score clarity, relevance and confidence across the conversation |
| `/api/full-interview-turn` | Run the multi-skill interview, adapting length to answer quality |
| `/api/full-interview-score` | Overall readiness, strengths, remaining gaps |

Two more endpoints carry no AI: `/api/jobs/search` aggregates live postings, `/api/jobs/jd` fetches
one posting's full text.

**Why stateless calls instead of one agent:** every prompt is small, auditable and explainable —
which is exactly what *"build what you can explain"* demands. It also means one failing step never
corrupts the rest of the session.

## 7. Architecture

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router) + TypeScript | API routes and UI in one deployable unit |
| UI | Tailwind CSS v4 + shadcn/ui | Fast, consistent, mobile-first |
| Model | Gemini `gemini-3.5-flash-lite` via `@google/generative-ai` | Free tier with a workable daily quota; JSON-mode output |
| Voice | Web Speech API (`SpeechRecognition` + `speechSynthesis`) | Runs in the browser — costs nothing and adds no AI calls |
| State | `sessionStorage` only | No database, no accounts, nothing to leak |
| Hosting | Vercel, `sin1` (Singapore) region | Closest region to Vietnam — two job sources and all users are there |

**Deliberately not built:** user accounts, a database, and a job-board crawler of our own. Each was
considered and rejected as a way to spend 48 hours on plumbing instead of on the learning loop.

## 8. Where the job data comes from

Live at the time of writing:

| Source | Method | Notes |
|---|---|---|
| **VietnamWorks** | Public JSON search API | Most reliable; returns the full posting inside the search result |
| **ITviec** | Static HTML search page | Vietnamese IT roles; rate-limits under rapid searching |
| **RemoteOK** | Public JSON API | International remote roles, for contrast |

Job listings are borrowed from public postings and attributed in the interface, with every job
linking back to its original page.

**On sources we stopped using:** TopCV was integrated and working, then began returning HTTP 403.
Its block page stated plainly that our requests had triggered its security system. We removed the
integration rather than work around it. A site's refusal is an answer, not an obstacle — and that
decision is part of what responsible use means here.

**In progress, not yet live:** CareerLink and TopDev have been verified as reachable and parseable
and are being integrated on a branch. They are not part of the deployed prototype yet.

## 9. Responsible AI

- **Explainable by construction.** Seven small prompts, each readable in full. Nothing is hidden in
  an agent loop.
- **No personal data.** No sign-up, no CV upload, no database. Session state dies with the tab.
- **Honest scoring.** Prompts explicitly forbid inflating scores to be encouraging. In testing, an
  off-topic answer scored 2/10 and the AI explained exactly why.
- **No fabricated results.** When the AI fails to score a session, the result screen says so and
  refuses to draw a before/after conclusion from placeholder numbers rather than congratulating the
  student on a score that was never measured.
- **Human review at every step.** The student sets their own ratings, can override the AI's choice
  of priority skill, edits the job description before analysis, and can cancel or retype any answer
  the microphone got wrong.
- **Attribution.** Borrowed job content is labelled as borrowed and linked to its source.

## 10. Built to survive a live demo

Every AI call falls back to prepared content on any failure and returns a normal response carrying
a `usedFallback` flag, so the interface can be honest about degraded output without ever showing a
stack trace. Job sources are queried in parallel and independently — one blocked or slow site
cannot take down the search.

This was not theoretical. During testing, Gemini returned HTTP 503 mid-interview. The fallback
question appeared, an amber notice explained that the offline question was a substitute, and the
session continued without interruption.

## 11. Known limitations

Stated plainly, because a prototype that hides them is harder to improve:

- **Free-tier latency is unpredictable** — measured between 1.6s and 21s for the same request.
  Nothing in our code causes it and nothing short of a paid tier fixes it.
- **Voice is English-only and Chrome-only.** The Web Speech API is `en-US` here and unsupported in
  some browsers; typing is always available as a fallback.
- **HTML-scraped sources are fragile by nature.** ITviec's markup can change without warning. The
  system degrades to the remaining sources when it does, and logs which source failed and why.
- **Session-only memory.** Closing the tab loses progress. That is the correct trade for a 48-hour
  prototype with no accounts, not a design we would ship.

## 12. What has been verified

- Full journey completed end to end in a browser against real Vietnamese job postings — from search
  through skill extraction, lesson, graded exercise, four interview turns, to the result screen.
- Skill extraction checked against real postings from all three live sources; all returned clean,
  relevant English skills with no fallback.
- Grading discriminates: a well-targeted answer scored 10/10, an off-topic one 2/10, a lazy one
  0/10.
- Security: the endpoint that fetches a job page by URL rejects internal addresses, look-alike
  hostnames and non-HTTPS URLs.
- The longest real posting found (8,560 characters) passes through every AI route without error.

---

*Team 15 — Liang Rong Xuan · Nguyen Gia Phat · Bui Van Thien · Nguyen Minh Quang · Phan Tran Hoang Tran*
