# AI Career Skill Coach — Current Work Summary

**Project Name:** AI Career Skill Coach  
**Event:** Global Hackathon 2026 (FPT University HCMC Campus, 15–17 September 2026)  
**Track:** Track 1 — Future Skills Readiness  
**Team:** Team 15 (Bui Van Thien, Liang Rong Xuan, Nguyen Gia Phat, Nguyen Minh Quang, Phan Tran Hoang Tran)  
**Workspace:** `ai-career-skill-coach`  
**Current Branch:** `feat/careerlink-topdev-sources`  

---

## 1. Executive Summary & Challenge Fit

### Challenge Statement
> *"How can AI help students identify, develop, and practice the skills they need to be ready for the future of learning and work in the AI era?"*

### Solution Overview
**AI Career Skill Coach** is a closed-loop learning and career-readiness platform that addresses student skill gaps through a two-step AI engine:
1. **AI Coach:** Scans real job descriptions (JDs), extracts core required skills, helps students perform self-ratings, pinpoints priority skill gaps, and generates targeted micro-lessons with practical exercises and instant automated grading.
2. **Simulated AI Interviewer:** Conducts single-skill and multi-skill interactive mock interviews (supporting hands-free voice conversations) to evaluate student interview readiness before real job applications.

---

## 2. Currently Active Branch & In-Progress Tasks

- **Current Git Branch:** `feat/careerlink-topdev-sources`
- **Files Currently Modified:**
  - [`lib/job-sources.ts`](file:///Users/buivanthien/Learn/hackathon/lib/job-sources.ts)
  - [`lib/types.ts`](file:///Users/buivanthien/Learn/hackathon/lib/types.ts)

### Active Work Objectives:
- **Multi-Source Real-Time Job Scraping:** Expanding real-time job search capabilities across Vietnamese and global portals including VietnamWorks, ITviec, CareerLink, TopDev, and RemoteOK.
- **SSRF Security Protection:** Enforcing strict host validation (`JD_FETCH_ALLOWED_HOSTS`) in serverless routes to prevent server-side request forgery (SSRF) vulnerabilities when fetching job details.
- **Resilient Fallback Mechanics:** Handling site structure variations and blocking (e.g., removing rate-limited/blocked sources like TopCV and replacing them with CareerLink and TopDev using robust regex and JSON-LD parsing).
- **Search Bar Enhancements:** Powering search bar keyword auto-suggestions to streamline student job search workflows.

---

## 3. End-to-End Product Pipeline (5-Step Closed Loop)

```
[Real Job Search / Paste JD] ──> [Skill Gap Analysis] ──> [Micro-Lesson & Exercise]
          │                             │                           │
          ▼                             ▼                           ▼
  Live Job Listings              Top 5 JD Skills             Tailored Lesson +
  (VietnamWorks, ITviec,        Self-Rating (1-5★)           AI Exercise Grading
   CareerLink, TopDev, etc.)    Priority Gap Selection
                                        │
                                        ▼
 [Unlockable Full Interview] ◄── [Voice/Text Mock Interview] ◄───────┘
  Multi-skill JD readiness        Single-skill practice
  Before-vs-after analysis        Hands-free STT/TTS mode
```

1. **Step 1: Input & Real Job Search (`/`)**
   - User inputs a custom Job Description or searches real live job postings from VietnamWorks, ITviec, CareerLink, TopDev, and RemoteOK with keyword auto-suggestions.
2. **Step 2: Skill Extraction & Gap Pinpointing (`/gap`)**
   - Gemini API extracts top 5 hard/soft skills required for the target role.
   - User self-rates proficiency on a 1–5 star scale.
   - System pinpoints the #1 priority skill gap while preserving human review/override.
3. **Step 3: Interactive Micro-Learning (`/learn`)**
   - AI generates a bite-sized, contextual lesson and practical real-world exercise.
   - User submits response -> AI grades submission instantly with actionable feedback and a numerical score.
4. **Step 4: Voice/Text Mock Interview (`/interview` & `/result`)**
   - Multi-turn AI mock interview targeting the specific skill gap.
   - Features **Hands-Free Voice Conversation Mode** utilizing browser Web Speech API (Speech-to-Text & Text-to-Speech).
   - Generates detailed scorecards and improvement insights upon completion.
5. **Step 5: Full Mock Interview (`/interview/full` & `/result/full`)**
   - Unlocked after all individual skills are trained.
   - Conducts an end-to-end multi-skill mock interview testing overall readiness across the entire JD profile.
   - Generates a before-vs-after comparative evaluation report.

---

## 4. Technical Architecture & Stack

| Layer | Technology | Usage & Rationale |
|---|---|---|
| **Frontend Framework** | Next.js (App Router), TypeScript | Server/client components, type safety |
| **Styling & UI** | Tailwind CSS + shadcn/ui | Modern, responsive component design |
| **AI LLM Engine** | `@google/generative-ai` (`gemini-3.5-flash-lite`) | Skill extraction, lesson generation, grading, interview turns |
| **Deployment Region** | Google Cloud `asia-southeast1` (Singapore) | Lower latency response times for users in Vietnam |
| **State Management** | Browser Session Storage (`lib/session-store.ts`) | Lightweight zero-database MVP architecture |
| **Voice Engine** | Web Speech API (`lib/use-speech.ts`) | Native browser STT (SpeechRecognition) & TTS (speechSynthesis) |

### Key API Handlers (`app/api/`)
- `/api/extract-skills` — Extracts key required skills from raw JDs.
- `/api/generate-lesson` — Generates customized lesson content and practice exercises.
- `/api/grade-exercise` — Evaluates user exercise submissions.
- `/api/interview-turn` — Drives single-skill multi-turn mock interview conversations.
- `/api/interview-score` — Scores single-skill interview performance.
- `/api/full-interview-turn` — Drives multi-skill comprehensive mock interview turns.
- `/api/full-interview-score` — Scores full interview performance across all skills.
- `/api/jobs/search` & `/api/jobs/jd` — Fetches real live job listings and detailed descriptions with SSRF safety checks.

---

## 5. Development Milestones & Progress Log

1. **Scaffolding & AI Setup:**
   - Initialized Next.js project with TypeScript, Tailwind CSS, and shadcn/ui components.
   - Configured Gemini API client with lazy singleton initialization (`lib/gemini.ts`).
   - Established Git workflow with branch protection and pull request rules.
2. **Core 4-Screen Pipeline:**
   - Implemented `/gap` (Skill extraction & self-rating).
   - Implemented `/learn` (Micro-lesson, exercise, and AI grading).
   - Implemented `/interview` (Multi-turn single-skill mock interview).
   - Implemented `/result` (Performance score & before/after summary).
3. **Voice Conversation Engine:**
   - Integrated Web Speech API (`lib/use-speech.ts`) for hands-free mic input and voice synthesis output during mock interviews.
4. **Full Mock Interview Mode:**
   - Built `/interview/full` and `/result/full` to unlock an end-to-end evaluation mode once all individual skills are trained.
5. **Real-time Job Aggregation (Current Feature):**
   - Added live job searching across VietnamWorks, ITviec, CareerLink, TopDev, and RemoteOK.
   - Added auto-suggest keyword recommendations in the search bar.
   - Added SSRF security filtering for outbound JD detail requests.

---

## 6. How to Run & Test

```bash
# 1. Install dependencies
npm install

# 2. Environment variables (.env.local)
# Ensure GEMINI_API_KEY is defined
GEMINI_API_KEY=your_gemini_api_key_here

# 3. Launch local development server
npm run dev
```

---

*Summary compiled on September 16, 2026 for Team 15 — Global Hackathon 2026.*
