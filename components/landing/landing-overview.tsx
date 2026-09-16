"use client";

import { AlertTriangle, CheckCircle } from "lucide-react";
import { motion } from "motion/react";

export function LandingOverview() {
  return (
    <section id="overview" className="w-full bg-paper-white border-b border-carbon py-24 md:py-32 select-none">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-8 lg:px-12">
        {/* Section Header with Scroll-Triggered Fade-in */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-4xl text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-carbon bg-sunburst px-4 py-1 text-xs font-bold tracking-[0.032em] text-carbon mb-6">
            THE GAP &amp; REALITY
          </div>
          <h2 className="font-lateral text-[clamp(42px,7vw,96px)] font-extrabold uppercase leading-[0.78] tracking-normal text-carbon">
            THEORY IS NEVER ENOUGH
          </h2>
          <p className="mt-6 max-w-2xl mx-auto font-aeonik text-base sm:text-xl font-medium leading-[1.3] text-carbon/80">
            Most students rely on vague job postings and passive lecture videos. In live interviews,
            they freeze up because they never experienced active conversational pressure.
          </p>
        </motion.div>

        {/* Side-by-Side Comparative Cards with Scroll-Triggered Reveal & Hover Elevation */}
        <div className="mt-16 sm:mt-20 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Traditional Way Card */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            whileHover={{ y: -6 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col justify-between rounded-[30px] border border-carbon bg-soft-mist p-8 sm:p-10 text-carbon cursor-default"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-carbon bg-ember px-3.5 py-1 text-xs font-bold tracking-[0.032em] text-paper-white">
                  <AlertTriangle className="size-3.5 text-paper-white" />
                  TRADITIONAL PREP
                </span>
                <span className="text-xs font-bold text-carbon/60">High Risk Rate</span>
              </div>

              <h3 className="mt-6 text-2xl sm:text-3xl font-extrabold tracking-tight text-carbon">
                Vague Study &amp; Zero Interview Pressure
              </h3>

              <ul className="mt-8 space-y-4 text-sm sm:text-base font-medium">
                <motion.li
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="flex items-start gap-3.5 rounded-[18px] border border-carbon bg-paper-white p-4"
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-carbon bg-ember text-xs font-black text-paper-white">
                    ✕
                  </span>
                  <span>
                    <strong>Ambiguous Job Descriptions:</strong> Hard to decipher which tech keywords are dealbreakers vs. nice-to-have extras.
                  </span>
                </motion.li>
                <motion.li
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="flex items-start gap-3.5 rounded-[18px] border border-carbon bg-paper-white p-4"
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-carbon bg-ember text-xs font-black text-paper-white">
                    ✕
                  </span>
                  <span>
                    <strong>Bloated Hour-Long Courses:</strong> Dozens of hours spent watching passive videos that don&apos;t fix your specific knowledge gap.
                  </span>
                </motion.li>
                <motion.li
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="flex items-start gap-3.5 rounded-[18px] border border-carbon bg-paper-white p-4"
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-carbon bg-ember text-xs font-black text-paper-white">
                    ✕
                  </span>
                  <span>
                    <strong>No Spoken Reflexes:</strong> Freezing up when recruiters press on problem-solving and architectural tradeoffs in English.
                  </span>
                </motion.li>
              </ul>
            </div>

            <div className="mt-8 rounded-[18px] border border-carbon bg-paper-white p-4 text-xs sm:text-sm font-bold text-carbon flex items-center justify-between">
              <span>Outcome: Failing live interviews just to discover your skill gaps.</span>
              <span className="text-lg">⚠️</span>
            </div>
          </motion.div>

          {/* Joblingo Closed Loop Card */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            whileHover={{ y: -6 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col justify-between rounded-[30px] border border-carbon bg-sky-wash p-8 sm:p-10 text-carbon cursor-default"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-carbon bg-mint-pop px-3.5 py-1 text-xs font-bold tracking-[0.032em] text-carbon">
                  <CheckCircle className="size-3.5 text-carbon" />
                  JOBLINGO CLOSED LOOP
                </span>
                <span className="text-xs font-bold text-carbon/70">Immediate Impact</span>
              </div>

              <h3 className="mt-6 text-2xl sm:text-3xl font-extrabold tracking-tight text-carbon">
                Pinpoint Targeting &amp; Spoken Voice Reflexes
              </h3>

              <ul className="mt-8 space-y-4 text-sm sm:text-base font-medium">
                <motion.li
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="flex items-start gap-3.5 rounded-[18px] border border-carbon bg-paper-white p-4"
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-carbon bg-mint-pop text-xs font-black text-carbon">
                    ✓
                  </span>
                  <span>
                    <strong>5-Second Live JD Parser:</strong> Gemini AI scans live listings and pinpoints your top missing skills immediately.
                  </span>
                </motion.li>
                <motion.li
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="flex items-start gap-3.5 rounded-[18px] border border-carbon bg-paper-white p-4"
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-carbon bg-mint-pop text-xs font-black text-carbon">
                    ✓
                  </span>
                  <span>
                    <strong>5-Step Micro-Lessons:</strong> Bite-sized modules paired with interactive exercises and instant 0–10 score rubrics.
                  </span>
                </motion.li>
                <motion.li
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="flex items-start gap-3.5 rounded-[18px] border border-carbon bg-paper-white p-4"
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-carbon bg-mint-pop text-xs font-black text-carbon">
                    ✓
                  </span>
                  <span>
                    <strong>AI Voice Interviewer:</strong> Live hands-free mock interviews in natural English with conversational feedback.
                  </span>
                </motion.li>
              </ul>
            </div>

            <div className="mt-8 rounded-[18px] border border-carbon bg-paper-white p-4 text-xs sm:text-sm font-bold text-carbon flex items-center justify-between">
              <span>Outcome: Stepping into real interviews with high Readiness Scores.</span>
              <span className="text-lg">🎯</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
