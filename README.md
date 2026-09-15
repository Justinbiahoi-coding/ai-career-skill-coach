# AI Career Skill Coach

A prototype built for **Global Hackathon 2026** (FPT University HCMC Campus, 15–17 Sep 2026) —
**Team 15**, **Track 1 — Future Skills Readiness**.

> How can AI help students identify, develop, and practice the skills they need to be ready for
> the future of learning and work in the AI era?

## The idea

An AI that plays two roles in one closed loop: a **coach** (analyzes a real job description →
pinpoints the skill gap → teaches/coaches the top-priority gap) and a **simulated interviewer**
(runs a mock interview focused on that same gap to measure how ready the student really is before
a real interview).

## Tech stack

- Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- Claude API (`@anthropic-ai/sdk`) for skill-gap extraction, lesson/exercise generation, grading,
  and the mock interview
- No database/auth — session state lives in the browser for the MVP
- Deploy target: Vercel

## Repo structure

```
app/            Next.js routes (pages + API route handlers)
components/     UI components (shadcn/ui + custom)
lib/            Claude client, prompts, session helpers
docs/           Official hackathon reference material (handbook, challenge brief, workshop guide)
```

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in ANTHROPIC_API_KEY
npm run dev
```
