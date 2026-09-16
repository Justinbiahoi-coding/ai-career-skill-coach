"use client";

import { ShieldCheck, Cpu, Database, EyeOff, Lock } from "lucide-react";
import { motion } from "motion/react";

export function LandingAiSpec() {
  const specs = [
    {
      step: "TIER 1",
      badgeBg: "bg-sunburst text-carbon",
      title: "Input Guardrails",
      desc: "Noise filtering, format validation, and sanitization before feeding raw job postings into LLM pipelines.",
      icon: ShieldCheck,
      cardBg: "bg-paper-white",
    },
    {
      step: "TIER 2",
      badgeBg: "bg-voltage-violet text-paper-white",
      title: "Structured Extraction",
      desc: "Gemini 2.5 extracts skills strictly via schema-enforced JSON, eliminating arbitrary free-form hallucinations.",
      icon: Cpu,
      cardBg: "bg-lavender",
    },
    {
      step: "TIER 3",
      badgeBg: "bg-electric-blue text-carbon",
      title: "Grounding & Taxonomy",
      desc: "Skills are cross-referenced with live verified tech industry databases from VietnamWorks, ITviec, and TopDev.",
      icon: Database,
      cardBg: "bg-paper-white",
    },
    {
      step: "TIER 4",
      badgeBg: "bg-mint-pop text-carbon",
      title: "Adaptive Rubrics",
      desc: "Evaluates practice answers across correctness, architectural reasoning, and technical English delivery.",
      icon: Lock,
      cardBg: "bg-soft-mist",
    },
    {
      step: "TIER 5",
      badgeBg: "bg-ember text-paper-white",
      title: "Zero-Retention Privacy",
      desc: "Zero PII storage; spoken audio sessions are streamed and processed ephemerally for active turns only.",
      icon: EyeOff,
      cardBg: "bg-paper-white",
    },
  ];

  return (
    <section id="ai-spec" className="w-full bg-sky-wash border-b border-carbon py-24 md:py-32 select-none">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-8 lg:px-12">
        {/* Section Header with Scroll Reveal */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-4xl text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-carbon bg-paper-white px-4 py-1 text-xs font-bold tracking-[0.032em] text-carbon mb-6">
            RESPONSIBLE AI &amp; ARCHITECTURE
          </div>
          <h2 className="font-lateral text-[clamp(38px,6vw,90px)] font-extrabold uppercase leading-[0.92] tracking-normal text-carbon">
            AI ARCHITECTURE &amp; TRUST
          </h2>
          <p className="mt-6 max-w-2xl mx-auto font-aeonik text-base sm:text-xl font-medium leading-[1.3] text-carbon/80">
            A 5-tier engineering pipeline built to eliminate hallucinations, enforce rigorous rubrics, and protect student privacy.
          </p>
        </motion.div>

        {/* 5-Layer Pipeline Grid with Staggered Scroll-Triggered Entrance */}
        <div className="mt-16 sm:mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {specs.map((item, idx) => {
            const Icon = item.icon;
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
                className={`flex flex-col justify-between rounded-[24px] border border-carbon ${item.cardBg} p-6 sm:p-7 text-carbon cursor-default`}
              >
                <div>
                  <span
                    className={`inline-block rounded-full border border-carbon px-3 py-1 text-[11px] font-extrabold tracking-[0.032em] ${item.badgeBg}`}
                  >
                    {item.step}
                  </span>

                  <motion.div
                    whileHover={{ rotate: 12, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className="mt-6 flex size-11 items-center justify-center rounded-full border border-carbon bg-paper-white text-carbon"
                  >
                    <Icon className="size-5 text-carbon" />
                  </motion.div>

                  <h3 className="mt-5 text-lg font-extrabold tracking-tight text-carbon">
                    {item.title}
                  </h3>
                  <p className="mt-2.5 text-xs sm:text-sm font-medium leading-relaxed text-carbon/80">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-carbon/20 text-[10px] font-bold uppercase tracking-[0.032em] text-carbon/60">
                  Pipeline Verified ✓
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
