import { Users, Code, Award, Sparkles } from "lucide-react";

export function LandingTeam() {
  const members = [
    {
      name: "Justin Biahoi",
      role: "AI Tech Lead & Fullstack",
      tagColor: "bg-sunburst text-carbon",
      avatarBg: "bg-sky-wash",
      initials: "JB",
      bio: "Leads Next.js App Router architecture, Gemini Structured Outputs pipeline, and AI Voice Mock interview turns.",
    },
    {
      name: "Alex Nguyen",
      role: "AI Research & Prompt Eng",
      tagColor: "bg-lavender text-carbon",
      avatarBg: "bg-mint-pop",
      initials: "AN",
      bio: "Engineered 0–10 rubric grading logic, Readiness Score algorithms, and anti-hallucination grounding.",
    },
    {
      name: "Minh Tran",
      role: "Product & UI/UX Design",
      tagColor: "bg-mint-pop text-carbon",
      avatarBg: "bg-lavender",
      initials: "MT",
      bio: "Designed the Slush Inflatable Sticker Universe design system, Job Buddy mascot interactions, and micro-learning UX.",
    },
    {
      name: "Ha Le",
      role: "Data & Scraping Engineer",
      tagColor: "bg-voltage-violet text-paper-white",
      avatarBg: "bg-sunburst",
      initials: "HL",
      bio: "Built real-world JD scrapers for VietnamWorks, ITviec, TopDev, along with skill taxonomy normalization.",
    },
  ];

  return (
    <section id="team" className="w-full bg-paper-white border-b border-carbon py-24 md:py-32 select-none">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-carbon bg-mint-pop px-4 py-1 text-xs font-bold tracking-[0.032em] text-carbon mb-6">
            GLOBAL HACKATHON 2026
          </div>
          <h2 className="font-lateral text-[clamp(40px,7vw,96px)] font-extrabold uppercase leading-[0.78] tracking-normal text-carbon">
            MEET THE TEAM
          </h2>
          <p className="mt-6 max-w-2xl mx-auto font-aeonik text-base sm:text-xl font-medium leading-[1.3] text-carbon/80">
            Crafted by Team 15 for Global Hackathon 2026 — Empowering students to bridge skill gaps and master interviews.
          </p>
        </div>

        {/* Team Grid with 1px Hand-cut Black Outlines */}
        <div className="mt-16 sm:mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {members.map((member, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-between rounded-[24px] border border-carbon bg-paper-white p-7 text-carbon transition-colors hover:bg-soft-mist"
            >
              <div>
                {/* Circular Hand-cut Avatar with 1px black outline */}
                <div
                  className={`flex size-14 items-center justify-center rounded-full border border-carbon ${member.avatarBg} font-lateral text-xl font-extrabold text-carbon`}
                >
                  {member.initials}
                </div>

                <div className="mt-6">
                  <span
                    className={`inline-block rounded-full border border-carbon px-3 py-0.5 text-[11px] font-bold tracking-[0.032em] ${member.tagColor}`}
                  >
                    {member.role}
                  </span>
                  <h3 className="mt-3 text-xl font-extrabold tracking-tight text-carbon">
                    {member.name}
                  </h3>
                  <p className="mt-2.5 text-xs sm:text-sm font-medium leading-relaxed text-carbon/80">
                    {member.bio}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-carbon/20 text-[11px] font-bold tracking-[0.032em] text-carbon/60">
                Team 15 Member
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
