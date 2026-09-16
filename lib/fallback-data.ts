import type {
  DialogueReplyResult,
  DrillCardResult,
  FullInterviewScoreResult,
  FullInterviewTurnResult,
  GenerateLessonResult,
  GradeExerciseResult,
  GradeStepResult,
  InterviewScoreResult,
  InterviewTurnResult,
  JobListing,
  KnowledgeCardResult,
  MixedCardResult,
  PracticeStep,
  Skill,
} from "./types";
import { DRILL_ITEM_COUNTS, MIXED_ITEM_COUNT } from "./prompts";

export interface SampleJd {
  label: string;
  jdText: string;
}

/**
 * Nghề gợi ý cho thanh tìm kiếm. Danh sách tĩnh, lọc ngay tại trình duyệt —
 * KHÔNG gọi API gợi ý theo từng phím gõ, vì đã đo thật: API của VietnamWorks
 * khớp theo từ nguyên vẹn chứ không khớp tiền tố, nên gõ "mark" trả về 0 kết
 * quả còn gõ "data" lại trả về "Trade Coordinator" — gợi ý kiểu đó trông như
 * hỏng. Cách này đổi lại luôn tức thì và không bao giờ trống.
 *
 * Mỗi từ khoá đã được kiểm chứng ngày 16/09/2026 là có job thật trả về
 * (ít nhất 5 job/từ), để người dùng không bấm vào một gợi ý rồi nhận kết quả
 * rỗng.
 */
export const JOB_SUGGESTIONS: string[] = [
  "Data Analyst",
  "Business Analyst",
  "Marketing",
  "Digital Marketing",
  "Frontend Developer",
  "Backend Developer",
  "Software Engineer",
  "Tester",
  "Product Manager",
  "Project Manager",
  "Designer",
  "UI/UX Designer",
  "Content Writer",
  "Sales",
  "Customer Service",
  "Kế toán",
  "Nhân sự",
  "Thực tập sinh",
];

/**
 * Bỏ dấu tiếng Việt + hạ chữ thường, để gõ "ke toan" vẫn khớp "Kế toán" —
 * sinh viên Việt Nam rất hay gõ không dấu khi tìm kiếm.
 */
export function normalizeForSearch(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .trim();
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

// Ảnh chụp job THẬT (lấy trực tiếp từ 4 nguồn ngày 16/09/2026), dùng khi cả 4
// nguồn đều không phản hồi. Mục đích là demo vẫn hiện được job thật của công ty
// thật thay vì danh sách trống, kể cả khi mạng hỏng lúc pitch.
export const FALLBACK_JOBS: JobListing[] = [
  {
    id: "VietnamWorks:https://www.vietnamworks.com/chuyen-gia-du-lieu-bao-cao-phong-quan-ly-kinh-doanh-khoi-khdn-2101905-jv",
    title: "Chuyên Gia Dữ Liệu Báo Cáo - Phòng Quản Lý Kinh Doanh - Khối KHDN",
    company: "Ngân Hàng TMCP Đại Chúng Việt Nam",
    source: "VietnamWorks",
    url: "https://www.vietnamworks.com/chuyen-gia-du-lieu-bao-cao-phong-quan-ly-kinh-doanh-khoi-khdn-2101905-jv",
    jdText: `- Thiết kế, xây dựng và hoàn thiện hệ thống báo cáo quản trị đa chiều, đảm bảo tính nhất quán, chính xác và khả năng khai thác phục vụ điều hành.
- Phân tích dữ liệu kinh doanh, theo dõi hiệu quả TOI, lãi suất cho vay và các chỉ tiêu tài chính quan...
- Bằng cấp: Tốt nghiệp đại học trở lên (ưu tiên thạc sĩ) các ngành kinh tế, tài chính, ngân hàng, quản trị kinh doanh hoặc phân tích dữ liệu.
- Kiến thức chuyên môn: Có kiến thức chuyên sâu về hệ thống báo cáo quản trị, phân tích dữ liệu, theo dõi hiệu quả...`,
  },
  {
    id: "ITviec:https://itviec.com/it-jobs/senior-data-analyst-crm-loyalty-golden-gate-4026?lab_feature=preview_jd_page",
    title: "Senior Data Analyst (CRM & Loyalty)",
    company: "Golden Gate",
    source: "ITviec",
    url: "https://itviec.com/it-jobs/senior-data-analyst-crm-loyalty-golden-gate-4026?lab_feature=preview_jd_page",
    jdText: `Top 3 reasons to join us

- Văn phòng xịn xò, môi trường năng động

- Được tham gia xây dựng nhiều sản phẩm

- Công ty F&B siêu to khổng lồ ứng dụng công nghệ

Job description

The Growth Analytics & Business Insights Analyst supports Growth & Loyalty activities through data analysis, performance reporting, and business insights.
The role focuses on Loyalty, Loyalty-related Trade Marketing programs, customer behavior, and related digital marketing journeys. Working under the direction of the Growth Marketing Supervisor, the Analyst will prepare reports and dashboards, analyze campaign and customer performance, and help the team identify opportunities for improvement.
The Analyst is also encouraged to raise questions and provide alternative perspectives when supported by data.
Key Responsibilities 
Growth, Loyalty & Customer Analytics 
- Analyze customer, transaction, membership, campaign, and digital interaction data to support Growth Marketing activities.
- Monitor key customer metrics, including acquisition, activation, engagement, retention, purchase frequency, spending, churn, and customer lifecycle.
- Evaluate Loyalty performance across membership tiers, customer segments, point earning and redemption, voucher usage, and promotional participation.
- Analyze Trade Marketing activities and digital customer journeys by relevant dimensions such as customer segment, campaign, c…`,
  },
  {
    id: "TopCV:https://www.topcv.vn/viec-lam/data-analyst-van-hanh-xanh-bike-lam-viec-tai-royal-city-ha-noi/2300763.html",
    title: "Data Analyst - Vận Hành Xanh Bike - Làm Việc Tại Royal City Hà Nội",
    company: "CÔNG TY CỔ PHẦN DI CHUYỂN XANH VÀ THÔNG MINH GSM",
    source: "TopCV",
    url: "https://www.topcv.vn/viec-lam/data-analyst-van-hanh-xanh-bike-lam-viec-tai-royal-city-ha-noi/2300763.html",
    jdText: `Mô tả công việc

1. Phân tích dữ liệu & Tối ưu Hiệu suất

- Phân tích, dự báo và cung cấp insight vận hành thông qua hệ thống dữ liệu nhằm xác định vấn đề trọng yếu, tối ưu cung – cầu theo khu vực/khung giờ, đánh giá hiệu suất tài xế theo cohort và hiệu quả các chương trình, chính sách.

- Xây dựng chính sách, quy chuẩn tài xế; tổ chức rà soát vận hành định kỳ và dẫn dắt các sáng kiến cải tiến liên tục nhằm nâng cao năng suất và hiệu quả hệ thống.

2. Điều phối dự án (PMO)

- Điều phối và kiểm soát tiến độ dự án; Phân tích và đánh giá hiệu quả tối ưu dự án vận hành

- Phối hợp công nghệ triển khai các dự án tự động hóa và cải tiến sản phẩm/app nhằm tối ưu quy trình vận hành, nâng cao trải nghiệm user và tăng hiệu quả vận hành tổng thể.

- Phối hợp với các phòng ban nội bộ và đối tác bên ngoài để triển khai kế hoạch phát triển.

Yêu cầu ứng viên

- Tốt nghiệp Đại học chuyên ngành Kinh tế, Tài chính, Kiểm toán, Công nghệ thông tin hoặc các ngành liên quan.

- Ưu tiên ứng viên có kinh nghiệm PMO, data analyst, business analyst tại các sàn/nền tảng công nghệ (Grab, Shopee, Lazada hoặc tương đương).

- Tư duy hệ thống, lập luận logic và khả năng lập kế hoạch tốt.

- Thành thạo các công cụ phân tích dữ liệu như SQL, Power BI và PowerPoint.

- Kỹ năng phân tích và báo cáo dữ liệu tốt, có khả năng xử lý tập dữ liệu lớn và rút ra insight thực tiễn.

- Chủ động, tự quản lý công việc end-…`,
  },
  {
    id: "RemoteOK:https://remoteOK.com/remote-jobs/remote-data-analyst-seahub-asia-1136222",
    title: "Data Analyst",
    company: "SEAhub Asia",
    source: "RemoteOK",
    url: "https://remoteOK.com/remote-jobs/remote-data-analyst-seahub-asia-1136222",
    jdText: `Build What's Next With Us

At SEAhub Asia, your career isn't just a job â it's a launchpad.

We move fast, think big, and build futures together.

What's waiting for you here?

Remote-first roles built for freedom and flexibility

Learning & Development That Sharpens Skills And Accelerates Careers

Competitive salary packages for high performers

Wellbeing perks that help you thrive inside and outside work

A team that supports, celebrates, and wins as one

and we're just getting started.

We're growing across Southeast Asia â and we're searching for sharp minds, big thinkers and curious hearts ready to help us build what's next. learners, and big thinkers who want to create what's next.

If you're ready to make a real impact and grow with a future-ready team, your next chapter starts here.

Job Summary

Support the Data Analytics team by assisting with data validation, report generation, and basic analysis to help ensure data accuracy and enable informed business decision-making. 

Responsibilities:

- Reporting, Analysis & Insight Communication
- Prepare reports and perform data analysis to support data-driven decision-making
- Monitor key business performance metrics to identify trends, patterns, and anomalies
- Assist in building and maintaining dashboards and reports for performance tracking
- Communicate data insights to stakeholders in a clear, concise, and actionabl…`,
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

export function buildFallbackKnowledgeCard(skillName: string): KnowledgeCardResult {
  return {
    articleText: `We couldn't reach the AI coach right now, so here's a general starting point for
"${skillName}". Break the skill into the smallest task you can practice today, do it once with a
real example from a job description, and compare your result against what a strong answer would
look like. Repetition on real examples beats reading theory for skills like this.

Employers checking for this skill usually look for three things: whether you can name a concrete
example of using it, whether you can explain your reasoning (not just the outcome), and whether
you know when NOT to use it. The most common mistake is describing the skill in the abstract
instead of walking through one real situation from start to finish.`,
    usedFallback: true,
  };
}

// One fallback item per drill type, reused (with light variation) to fill
// out DRILL_ITEM_COUNTS[type] items — a placeholder set still needs to be
// the right length, or the card would look broken rather than degraded.
function fallbackItemForType(type: string, skillName: string, index: number): PracticeStep {
  switch (type) {
    case "multiple_choice":
      return {
        type: "multiple_choice",
        question: `Which approach best describes how to improve at "${skillName}"? (${index + 1})`,
        options: [
          "Practice on a real example, then compare against a strong answer",
          "Read about it until it feels familiar",
          "Wait until a real job requires it",
          "Memorize a definition",
        ],
        correctIndex: 0,
        explanation:
          "Deliberate practice on real examples, checked against a strong answer, builds the skill faster than reading alone.",
      };
    case "fill_blank":
      return {
        type: "fill_blank",
        sentence: `The fastest way to get better at "${skillName}" is deliberate ___ on real examples.`,
        correctAnswer: "practice",
        explanation: "Deliberate practice — repeating a task with feedback — is what turns knowledge into skill.",
      };
    case "reorder":
      return {
        type: "reorder",
        instruction: `Put these steps for practicing "${skillName}" in the right order.`,
        correctOrder: [
          "Pick one real example from a job description",
          "Attempt it yourself",
          "Compare your result to a strong answer",
          "Note the one biggest gap to fix next time",
        ],
        explanation: "Starting from a real example keeps practice grounded instead of abstract.",
      };
    case "free_text":
      return {
        type: "free_text",
        prompt: `Describe one specific situation where "${skillName}" would come up in this job, and write out exactly what you would do step by step.`,
      };
    case "mini_dialogue":
    default:
      return {
        type: "mini_dialogue",
        openingQuestion: `Can you walk me through a time you actually used "${skillName}" on something real?`,
      };
  }
}

export function buildFallbackDrillCard(type: string, skillName: string): DrillCardResult {
  const count = DRILL_ITEM_COUNTS[type] ?? 4;
  return {
    items: Array.from({ length: count }, (_, i) => fallbackItemForType(type, skillName, i)),
    usedFallback: true,
  };
}

export function buildFallbackMixedCard(skillName: string): MixedCardResult {
  const types = ["multiple_choice", "fill_blank", "reorder", "free_text", "mini_dialogue"];
  const items: PracticeStep[] = [];
  for (let i = 0; i < MIXED_ITEM_COUNT; i++) {
    items.push(fallbackItemForType(types[i % types.length], skillName, i));
  }
  return { items, usedFallback: true };
}

export const FALLBACK_STEP_GRADE: GradeStepResult = {
  score: 6,
  feedback:
    "The AI grader is unavailable right now, so this is a placeholder score. Your answer was recorded — try again once the connection is back for real feedback.",
  usedFallback: true,
};

export function buildFallbackDialogueReply(turnNumber: number): DialogueReplyResult {
  const isLast = turnNumber >= 2;
  return {
    reply: isLast
      ? "Thanks for walking me through that — the AI interviewer is unavailable right now, but that's a good real-world example to have ready."
      : "Interesting — the AI interviewer is unavailable right now, but keep that example in mind for later.",
    isLast,
    usedFallback: true,
  };
}

const FALLBACK_INTERVIEW_QUESTIONS = [
  "Can you walk me through a time you actually used this skill on a real project?",
  "What's the part of this skill you find hardest, and how do you usually deal with it?",
  "How would you explain this skill to someone who has never done it before?",
  "If you had one month to get noticeably better at this skill, what would you focus on first?",
];

export function buildFallbackInterviewTurn(
  questionNumber: number,
  maxQuestions: number
): InterviewTurnResult {
  const question =
    FALLBACK_INTERVIEW_QUESTIONS[(questionNumber - 1) % FALLBACK_INTERVIEW_QUESTIONS.length];
  return { question, isLast: questionNumber >= maxQuestions, usedFallback: true };
}

export const FALLBACK_INTERVIEW_SCORE: InterviewScoreResult = {
  clarity: 6,
  relevance: 6,
  confidence: 6,
  overallFeedback:
    "The AI interviewer is unavailable right now, so these are placeholder scores. Try again once the connection is back for real feedback.",
  usedFallback: true,
};

export function buildFallbackFullInterviewTurn(
  questionNumber: number,
  maxQuestions: number,
  practicedSkills: string[]
): FullInterviewTurnResult {
  if (questionNumber === 1) {
    return {
      question: "To start, could you tell me a bit about yourself and why this role interests you?",
      isLast: maxQuestions <= 1,
      usedFallback: true,
    };
  }
  const isClosing = questionNumber >= maxQuestions;
  if (isClosing) {
    return {
      question: "That covers everything I wanted to ask - do you have any questions for me?",
      isLast: true,
      usedFallback: true,
    };
  }
  const skillIndex = (questionNumber - 2) % Math.max(practicedSkills.length, 1);
  const skill = practicedSkills[skillIndex] ?? "this role";
  return {
    question: `Can you walk me through how you'd apply "${skill}" in a real situation for this job?`,
    isLast: false,
    usedFallback: true,
  };
}

export const FALLBACK_FULL_INTERVIEW_SCORE: FullInterviewScoreResult = {
  overallReadiness: 6,
  strengths: "The AI interviewer is unavailable right now, so this is placeholder feedback.",
  gaps: "Try again once the connection is back for a real assessment.",
  overallFeedback:
    "The AI interviewer failed to score this session, so these are placeholder scores.",
  usedFallback: true,
};
