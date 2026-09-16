"use client";

import Link from "next/link";
import { ArrowRight, PlayCircle, Sparkles, Mic, CheckCircle2, ShieldCheck } from "lucide-react";
import { Mascot } from "@/components/mascot";
import { motion } from "motion/react";

export function LandingHero() {
  return (
    <section
      id="hero"
      className="relative min-h-[92vh] w-full bg-sky-wash px-6 pt-12 pb-24 md:pt-20 md:pb-32 overflow-hidden flex flex-col items-center text-center select-none"
    >
      {/* Floating 2D Multi-Colored Stickers with Entry Animation & Gentle Hover */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotate: -24 }}
        animate={{ opacity: 1, scale: 1, rotate: -12 }}
        whileHover={{ scale: 1.08, rotate: -6 }}
        transition={{ duration: 0.5, delay: 0.2, type: "spring", stiffness: 300 }}
        className="hidden sm:flex absolute top-16 left-[5%] lg:left-[10%] items-center gap-2 rounded-[20px] border border-carbon bg-ember px-4 py-2.5 text-paper-white text-sm font-bold tracking-[0.032em] z-20 cursor-default"
      >
        <span className="text-xl">🚀</span>
        <span>AI Gap Scanner</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotate: 24 }}
        animate={{ opacity: 1, scale: 1, rotate: 12 }}
        whileHover={{ scale: 1.08, rotate: 6 }}
        transition={{ duration: 0.5, delay: 0.25, type: "spring", stiffness: 300 }}
        className="hidden sm:flex absolute top-24 right-[6%] lg:right-[12%] items-center gap-2 rounded-[20px] border border-carbon bg-sunburst px-4 py-2.5 text-carbon text-sm font-bold tracking-[0.032em] z-20 cursor-default"
      >
        <span className="text-xl">🪙</span>
        <span>Streak &amp; XP 100%</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
        animate={{ opacity: 1, scale: 1, rotate: 6 }}
        whileHover={{ scale: 1.08, rotate: 0 }}
        transition={{ duration: 0.5, delay: 0.35, type: "spring", stiffness: 300 }}
        className="hidden md:flex absolute bottom-36 left-[4%] lg:left-[8%] items-center gap-2 rounded-[16px] border border-carbon bg-voltage-violet px-4 py-2 text-paper-white text-xs font-bold tracking-[0.032em] z-20 cursor-default"
      >
        <span className="text-lg">👛</span>
        <span>Voice Mock Turn</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotate: 16 }}
        animate={{ opacity: 1, scale: 1, rotate: -6 }}
        whileHover={{ scale: 1.08, rotate: 0 }}
        transition={{ duration: 0.5, delay: 0.4, type: "spring", stiffness: 300 }}
        className="hidden md:flex absolute bottom-44 right-[5%] lg:right-[10%] items-center gap-2 rounded-[20px] border border-carbon bg-mint-pop px-4 py-2 text-carbon text-xs font-bold tracking-[0.032em] z-20 cursor-default"
      >
        <span className="text-lg">✓</span>
        <span>Real JD Verified</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1, rotate: -3 }}
        whileHover={{ scale: 1.08, rotate: 0 }}
        transition={{ duration: 0.5, delay: 0.45, type: "spring", stiffness: 300 }}
        className="hidden lg:flex absolute top-80 left-[18%] items-center gap-1.5 rounded-[16px] border border-carbon bg-lavender px-3 py-1.5 text-carbon text-xs font-bold tracking-[0.032em] z-20 cursor-default"
      >
        <span>✨</span>
        <span>Team 15 · Track 1</span>
      </motion.div>

      {/* Background 3D Inflatable Ribbon Sculpture (Electric Blue Graphic) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 0.9, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-[1200px] h-64 pointer-events-none -z-0 overflow-hidden"
      >
        <svg
          viewBox="0 0 1000 320"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <path
            d="M50 200 C 250 50, 450 350, 700 120 C 850 -20, 950 180, 980 220"
            stroke="#2b8cf5"
            strokeWidth="70"
            strokeLinecap="round"
          />
          <path
            d="M50 190 C 250 40, 450 340, 700 110 C 850 -30, 950 170, 980 210"
            stroke="#4da2ff"
            strokeWidth="60"
            strokeLinecap="round"
          />
          <path
            d="M60 178 C 250 30, 450 330, 700 100 C 850 -40, 950 160, 970 200"
            stroke="#7cc0ff"
            strokeWidth="20"
            strokeLinecap="round"
            opacity="0.8"
          />
        </svg>
      </motion.div>

      <div className="relative z-10 mx-auto max-w-[1440px] px-4 flex flex-col items-center">
        {/* Hackathon Badge Pill with Smooth Fade-in */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 rounded-full border border-carbon bg-paper-white px-4 py-1.5 text-xs font-bold tracking-[0.032em] text-carbon mb-6"
        >
          <Sparkles className="size-3.5 text-carbon" />
          <span>Global Hackathon 2026 · Team 15</span>
        </motion.div>

        {/* Sculptural Display Headline (Lateral 800) - Fade-in & Slide-up */}
        <motion.h1
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="font-lateral text-[clamp(68px,15vw,220px)] font-extrabold uppercase leading-[0.78] tracking-normal text-carbon text-center"
        >
          JOBLINGO
        </motion.h1>

        {/* Subtitle Line in Lateral Display */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-2 font-lateral text-[clamp(24px,4vw,56px)] font-extrabold uppercase leading-[0.85] text-carbon"
        >
          CAREER SKILL COACH
        </motion.div>

        {/* Tagline directly under display block */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 max-w-2xl font-aeonik text-[18px] sm:text-[22px] font-medium leading-[1.3] tracking-[-0.01em] text-carbon"
        >
          Inflatable sticker universe for your career readiness. Scan live job postings from{" "}
          <strong className="underline decoration-carbon underline-offset-4 font-bold">VietnamWorks, ITviec, TopDev</strong>,
          discover your skill gaps, and master hands-free AI voice mock interviews.
        </motion.p>

        {/* Action Buttons: Fade-in & Slide-up with Spring Hover/Tap */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <Link
              href="/home"
              className="inline-flex items-center gap-2.5 rounded-full border border-carbon bg-carbon px-8 py-4 text-sm font-bold tracking-[0.032em] text-paper-white"
            >
              <span>Start Practicing Free</span>
              <ArrowRight className="size-4.5" />
            </Link>
          </motion.div>

          <motion.a
            href="#how-it-works"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="inline-flex items-center gap-2.5 rounded-full border border-carbon bg-paper-white px-7 py-4 text-sm font-bold tracking-[0.032em] text-carbon hover:bg-soft-mist transition-colors"
          >
            <PlayCircle className="size-4.5 text-carbon" />
            <span>Explore 5-Step Flow</span>
          </motion.a>
        </motion.div>

        {/* Trust Badges in Soft Mist Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.48, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm font-bold tracking-[0.02em] text-carbon"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-2 rounded-full border border-carbon bg-paper-white px-4 py-2"
          >
            <CheckCircle2 className="size-4 text-carbon" />
            <span>No Account Required</span>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-2 rounded-full border border-carbon bg-paper-white px-4 py-2"
          >
            <ShieldCheck className="size-4 text-carbon" />
            <span>100% Real Job Data</span>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-2 rounded-full border border-carbon bg-paper-white px-4 py-2"
          >
            <Mic className="size-4 text-carbon" />
            <span>Hands-Free Voice Practice</span>
          </motion.div>
        </motion.div>

        {/* Interactive Physical Sticker Preview Card with Hover Lift */}
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -4 }}
          transition={{ duration: 0.55, delay: 0.52, ease: [0.16, 1, 0.3, 1] }}
          className="mt-14 w-full max-w-xl rounded-[30px] border border-carbon bg-paper-white p-6 sm:p-8 text-left text-carbon"
        >
          {/* Card Header Pill Strip */}
          <div className="flex items-center justify-between pb-4 border-b border-carbon">
            <div className="flex items-center gap-2.5">
              <span className="size-3 rounded-full border border-carbon bg-mint-pop animate-pulse" />
              <span className="text-xs sm:text-sm font-bold tracking-[0.032em]">AI Live Simulation</span>
            </div>
            <motion.span
              whileHover={{ scale: 1.08 }}
              className="rounded-full border border-carbon bg-sunburst px-3 py-1 text-xs font-bold text-carbon"
            >
              Streak: 5 Days 🔥
            </motion.span>
          </div>

          {/* Card Mascot Visual */}
          <div className="relative my-6 flex justify-center items-center py-4 bg-sky-wash/40 rounded-[20px] border border-carbon">
            <Mascot mood="happy" size="lg" priority decorative />

            {/* Overlapping Sticker Badges with Hover Micro-interactivity */}
            <motion.div
              whileHover={{ scale: 1.1, rotate: 0 }}
              className="absolute -top-3 -left-3 -rotate-6 rounded-[14px] border border-carbon bg-lavender px-3 py-1 text-xs font-bold cursor-default"
            >
              ⚡ Gap: System Design
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.1, rotate: 0 }}
              className="absolute -bottom-2 -right-3 rotate-6 rounded-[14px] border border-carbon bg-mint-pop px-3 py-1 text-xs font-bold cursor-default"
            >
              ✓ Score: 9.2/10
            </motion.div>
          </div>

          {/* Audio Wave Simulation */}
          <div className="rounded-[18px] border border-carbon bg-soft-mist p-4">
            <div className="flex items-center justify-between text-xs font-bold mb-2">
              <span className="text-carbon/70">AI Voice Mock Simulation</span>
              <span className="text-carbon uppercase font-extrabold tracking-wider">Active</span>
            </div>
            <div className="flex items-center gap-1.5 h-7 justify-center">
              {[35, 70, 50, 90, 60, 80, 45, 95, 75, 50, 85, 40, 65, 80, 55, 30].map((h, i) => (
                <motion.span
                  key={i}
                  animate={{
                    height: [`${h * 0.6}%`, `${h}%`, `${h * 0.7}%`],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    repeatType: "reverse",
                    delay: (i % 5) * 0.15,
                    ease: "easeInOut",
                  }}
                  className="w-1.5 rounded-full bg-carbon"
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
