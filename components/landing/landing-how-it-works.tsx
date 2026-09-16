"use client";

import { Search, BrainCircuit, BookOpen, Mic, Trophy } from "lucide-react";
import { motion } from "motion/react";

export function LandingHowItWorks() {
  const steps = [
    {
      number: "01",
      badge: "STEP 01",
      badgeBg: "bg-sunburst text-carbon",
      title: "Parse Live JDs",
      description: "Paste URLs or raw job postings directly from VietnamWorks, ITviec, TopDev to extract structured requirements.",
      icon: Search,
      cardBg: "bg-paper-white",
    },
    {
      number: "02",
      badge: "STEP 02",
      badgeBg: "bg-voltage-violet text-paper-white",
      title: "Map Skill Gaps",
      description: "AI compares your current profile against the JD, isolating your top 3–5 high-impact missing skills.",
      icon: BrainCircuit,
      cardBg: "bg-lavender",
    },
    {
      number: "03",
      badge: "STEP 03",
      badgeBg: "bg-electric-blue text-carbon",
      title: "5-Min Micro-Lessons",
      description: "Bite-sized 5-step learning: core concepts, recruiter grilling scenarios, pitfalls, and interactive 0–10 grading.",
      icon: BookOpen,
      cardBg: "bg-sky-wash",
    },
    {
      number: "04",
      badge: "STEP 04",
      badgeBg: "bg-ember text-paper-white",
      title: "AI Voice Mock Turn",
      description: "Put on headphones and practice spoken responses hands-free in natural English with instant conversational critique.",
      icon: Mic,
      cardBg: "bg-paper-white",
    },
    {
      number: "05",
      badge: "STEP 05",
      badgeBg: "bg-carbon text-paper-white",
      title: "Readiness Score",
      description: "Get a comprehensive 0–100% readiness evaluation, diagnose remaining blindspots, and sustain your daily streak.",
      icon: Trophy,
      cardBg: "bg-mint-pop",
    },
  ];

  return (
    <section id="how-it-works" className="w-full bg-concrete-gray border-b border-carbon py-24 md:py-32 select-none">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-8 lg:px-12">
        {/* Section Header with Scroll-Triggered Reveal */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-4xl text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-carbon bg-paper-white px-4 py-1 text-xs font-bold tracking-[0.032em] text-carbon mb-6">
            5-STEP CLOSED LOOP
          </div>
          <h2 className="font-lateral text-[clamp(40px,7vw,96px)] font-extrabold uppercase leading-[0.78] tracking-normal text-carbon">
            HOW IT WORKS
          </h2>
          <p className="mt-6 max-w-2xl mx-auto font-aeonik text-base sm:text-xl font-medium leading-[1.3] text-carbon/80">
            From live job description parsing to real-time conversational mastery in five smooth steps.
          </p>
        </motion.div>

        {/* 5-Step Card Grid with Staggered Scroll-Triggered Entrance & Interactive Hover */}
        <div className="mt-16 sm:mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{
                  duration: 0.45,
                  delay: idx * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={`flex flex-col justify-between rounded-[24px] border border-carbon ${step.cardBg} p-6 sm:p-7 text-carbon cursor-default`}
              >
                <div>
                  {/* Step Badge & Number */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`rounded-full border border-carbon px-3 py-1 text-[11px] font-extrabold tracking-[0.032em] ${step.badgeBg}`}
                    >
                      {step.badge}
                    </span>
                    <span className="font-lateral text-3xl font-extrabold text-carbon/40">
                      {step.number}
                    </span>
                  </div>

                  {/* Icon Circle with Spring Hover */}
                  <motion.div
                    whileHover={{ rotate: 12, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className="mt-6 flex size-12 items-center justify-center rounded-full border border-carbon bg-paper-white text-carbon"
                  >
                    <Icon className="size-6 text-carbon" />
                  </motion.div>

                  {/* Title & Description */}
                  <h3 className="mt-5 text-xl font-extrabold tracking-tight text-carbon">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm font-medium leading-relaxed text-carbon/80">
                    {step.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-carbon/20 text-[11px] font-bold tracking-[0.032em] text-carbon/60 uppercase">
                  Step {idx + 1} of 5
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
