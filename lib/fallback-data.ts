import type { GenerateLessonResult, GradeExerciseResult, Skill } from "./types";

export interface SampleJd {
  label: string;
  jdText: string;
}

export const SAMPLE_JDS: SampleJd[] = [
  {
    label: "Junior Data Analyst",
    jdText: `Junior Data Analyst

We are looking for a Junior Data Analyst to join our operations team.

Responsibilities:
- Write SQL queries to pull and clean data from multiple internal databases
- Build dashboards in Power BI or Tableau to track key business metrics
- Communicate findings clearly to non-technical stakeholders in weekly reviews
- Perform basic statistical analysis (trends, correlations) using Excel or Python
- Document data definitions and maintain a shared metrics glossary

Requirements:
- Comfortable writing SQL joins and aggregations
- Basic Python or R for data manipulation (pandas is a plus)
- Strong attention to detail and ability to spot data quality issues
- Able to present findings clearly to a non-technical audience`,
  },
  {
    label: "Frontend Developer Intern",
    jdText: `Frontend Developer Intern

Join our product team to help build customer-facing web features.

Responsibilities:
- Implement UI components in React based on Figma designs
- Write clean, reusable TypeScript code and basic unit tests
- Collaborate with designers and backend engineers in an agile team
- Fix bugs reported by QA and users, with clear communication on progress
- Participate in code reviews and daily standups

Requirements:
- Solid understanding of HTML, CSS, and JavaScript/TypeScript fundamentals
- Some experience with React or a similar component-based framework
- Comfortable using Git for version control
- Willingness to receive and act on code review feedback`,
  },
];

// Dùng khi Claude API lỗi hoặc trả JSON không parse được — giữ demo không
// bị đứng hình giữa lúc trình bày trên sân khấu.
export const FALLBACK_SKILLS: Skill[] = [
  { name: "SQL querying", importance: "high", type: "hard" },
  { name: "Dashboard tools (Power BI / Tableau)", importance: "high", type: "hard" },
  { name: "Stakeholder communication", importance: "high", type: "soft" },
  { name: "Basic statistics", importance: "medium", type: "hard" },
  { name: "Python/R for data manipulation", importance: "medium", type: "hard" },
  { name: "Attention to detail", importance: "medium", type: "soft" },
];

export function buildFallbackLesson(skillName: string): GenerateLessonResult {
  return {
    lessonText: `We couldn't reach the AI coach right now, so here's a general starting point for
"${skillName}". Break the skill into the smallest task you can practice today, do it once with a
real example from a job description, and compare your result against what a strong answer would
look like. Repetition on real examples beats reading theory for skills like this.`,
    exercisePrompt: `Describe one specific situation where "${skillName}" would come up in this job,
and write out exactly what you would do step by step.`,
    usedFallback: true,
  };
}

export const FALLBACK_GRADE: GradeExerciseResult = {
  score: 6,
  feedback:
    "The AI grader is unavailable right now, so this is a placeholder score. Your answer was recorded — try again once the connection is back for real feedback.",
  usedFallback: true,
};
