import { Sparkles, Mic, FileSearch, CheckCircle2, Flame, Award, QrCode } from "lucide-react";

export function LandingFeatures() {
  return (
    <section id="features" className="w-full bg-paper-white border-b border-carbon py-24 md:py-32 select-none">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-8 lg:px-12">
        {/* Section Header with Crushed Lateral Display Headline */}
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-carbon bg-lavender px-4 py-1 text-xs font-bold tracking-[0.032em] text-carbon mb-6">
            FEATURE ECOSYSTEM
          </div>
          <h2 className="font-lateral text-[clamp(40px,7vw,96px)] font-extrabold uppercase leading-[0.78] tracking-normal text-carbon">
            POWERFUL FEATURES
          </h2>
          <p className="mt-6 max-w-2xl mx-auto font-aeonik text-base sm:text-xl font-medium leading-[1.3] text-carbon/80">
            Rigorous interview preparation mechanics wrapped in a vibrant, physical sticker-book aesthetic.
          </p>
        </div>

        {/* Bento Grid with 1px Hand-cut Black Borders */}
        <div className="mt-16 sm:mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Bento Card 1: Job Match Engine (Sky Wash) */}
          <div className="flex flex-col justify-between rounded-[30px] border border-carbon bg-sky-wash p-8 text-carbon">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-carbon bg-paper-white px-3 py-1 text-xs font-bold tracking-[0.032em] text-carbon">
                  REAL-WORLD DATA
                </span>
                <FileSearch className="size-5 text-carbon" />
              </div>
              <h3 className="mt-6 text-2xl font-extrabold tracking-tight text-carbon">
                Job Match &amp; JD Parser
              </h3>
              <p className="mt-3 text-sm font-medium leading-relaxed text-carbon/80">
                Automatically extract tech keywords from live postings on VietnamWorks, ITviec, TopDev, isolating the exact skills recruiters demand.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {["VietnamWorks", "ITviec", "TopDev", "Regex Parser"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-carbon bg-paper-white px-3 py-1 text-xs font-bold text-carbon"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Bento Card 2: AI Voice Interviewer (Lavender) */}
          <div className="flex flex-col justify-between rounded-[30px] border border-carbon bg-lavender p-8 text-carbon">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-carbon bg-paper-white px-3 py-1 text-xs font-bold tracking-[0.032em] text-carbon">
                  VOICE AI HANDS-FREE
                </span>
                <Mic className="size-5 text-carbon" />
              </div>
              <h3 className="mt-6 text-2xl font-extrabold tracking-tight text-carbon">
                AI Voice Interviewer
              </h3>
              <p className="mt-3 text-sm font-medium leading-relaxed text-carbon/80">
                Practice 1:1 spoken interviews in English with Job Buddy. Receive instant feedback on pronunciation, answer structure, and behavioral agility.
              </p>
            </div>

            <div className="mt-8 rounded-[20px] border border-carbon bg-paper-white p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full border border-carbon bg-mint-pop animate-pulse" />
                <span className="text-xs font-bold text-carbon">Response Latency</span>
              </div>
              <span className="text-xs font-extrabold text-carbon">&lt; 800ms</span>
            </div>
          </div>

          {/* Bento Card 3: Split QR Card & Mobile Access (Slush Signature Blueprint) */}
          <div className="flex flex-col justify-between rounded-[30px] border border-carbon bg-soft-mist p-8 text-carbon">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-carbon bg-paper-white px-3 py-1 text-xs font-bold tracking-[0.032em] text-carbon">
                  CROSS-PLATFORM
                </span>
                <Sparkles className="size-5 text-carbon" />
              </div>
              <h3 className="mt-6 text-2xl font-extrabold tracking-tight text-carbon">
                Learn Anywhere on Mobile
              </h3>
              <p className="mt-3 text-sm font-medium leading-relaxed text-carbon/80">
                Scan the QR code to open our mobile-optimized web experience and practice spoken mock turns whenever you have 5 minutes.
              </p>
            </div>

            {/* Slush Signature Blueprint 3.4: Split QR Download Card */}
            <div className="mt-8 flex w-full items-stretch rounded-[20px] border border-carbon bg-voltage-violet overflow-hidden">
              <div className="flex items-center justify-center bg-paper-white p-3.5 border-r border-carbon">
                <QrCode className="size-12 text-carbon" />
              </div>
              <div className="flex flex-1 flex-col justify-center px-4 py-3 text-paper-white">
                <span className="text-[10px] font-bold uppercase tracking-[0.032em] opacity-80">
                  Quick Mobile Scan
                </span>
                <span className="text-[14px] font-extrabold tracking-[0.032em]">
                  JOBLINGO APP
                </span>
              </div>
            </div>
          </div>

          {/* Bento Card 4: Micro-Lesson Engine (Paper White with Mint Pop border) */}
          <div className="flex flex-col justify-between rounded-[30px] border border-carbon bg-paper-white p-8 text-carbon">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-carbon bg-mint-pop px-3 py-1 text-xs font-bold tracking-[0.032em] text-carbon">
                  5-MIN LESSONS
                </span>
                <CheckCircle2 className="size-5 text-carbon" />
              </div>
              <h3 className="mt-6 text-2xl font-extrabold tracking-tight text-carbon">
                Bite-Sized Micro-Lessons
              </h3>
              <p className="mt-3 text-sm font-medium leading-relaxed text-carbon/80">
                5-step modules: core concepts, recruiter grilling scenarios, common pitfalls, and interactive 0–10 grading rubrics with thorough explanations.
              </p>
            </div>

            <div className="mt-8 rounded-[20px] border border-carbon bg-sky-wash p-4 text-xs font-bold text-carbon">
              ✓ Master critical interview skills in just 5–7 minutes a day
            </div>
          </div>

          {/* Bento Card 5: Gamification & Streak (Sunburst) */}
          <div className="md:col-span-2 flex flex-col justify-between rounded-[30px] border border-carbon bg-sunburst p-8 text-carbon">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-carbon bg-paper-white px-3 py-1 text-xs font-bold tracking-[0.032em] text-carbon">
                  HABIT BUILDING
                </span>
                <Flame className="size-5 text-carbon" />
              </div>
              <h3 className="mt-6 text-2xl sm:text-3xl font-extrabold tracking-tight text-carbon">
                Gamification, Streaks &amp; Readiness Score
              </h3>
              <p className="mt-3 max-w-xl text-sm sm:text-base font-medium leading-relaxed text-carbon/90">
                Build lasting confidence through daily streaks, XP rewards, and an objective 0–100% interview readiness index that tracks your actual growth.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-4 items-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-carbon bg-paper-white px-4 py-2 text-sm font-bold text-carbon">
                <span>🔥 7-Day Streak</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-carbon bg-paper-white px-4 py-2 text-sm font-bold text-carbon">
                <span>⭐ +500 XP</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-carbon bg-paper-white px-4 py-2 text-sm font-bold text-carbon">
                <span>🏆 92% Readiness</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
