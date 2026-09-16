"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, PlayCircle, Sparkles, Mic, CheckCircle2, ShieldCheck } from "lucide-react";
import { MascotIntroChat } from "./mascot-intro-chat";
import { motion } from "motion/react";

export interface LandingHeroProps {
  /** Signed-in visitors skip sign-up and go straight into the tool. */
  isSignedIn?: boolean;
}

export function LandingHero({ isSignedIn = false }: LandingHeroProps) {
  return (
    <section
      id="hero"
      className="relative min-h-[92vh] w-full bg-sky-wash px-6 pt-12 pb-24 md:pt-20 md:pb-32 overflow-hidden flex flex-col items-center text-center select-none"
    >
      {/* 1. Floating 2D Multi-Colored Stickers with Continuous Floating Motion */}

      {/* Top Left: AI Gap Scanner (Ember #fb4903) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: [-10, 10, -10],
          rotate: [-14, -9, -14],
        }}
        whileHover={{ scale: 1.12, rotate: -4 }}
        transition={{
          opacity: { duration: 0.5, delay: 0.15 },
          scale: { duration: 0.5, delay: 0.15 },
          y: { duration: 4.2, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 5.0, repeat: Infinity, ease: "easeInOut" },
        }}
        className="hidden sm:flex absolute top-16 left-[5%] lg:left-[10%] items-center gap-2 rounded-[20px] border border-carbon bg-ember px-4 py-2.5 text-paper-white text-sm font-bold tracking-[0.032em] z-20 cursor-pointer"
      >
        <span className="text-xl">🚀</span>
        <span>AI Gap Scanner</span>
      </motion.div>

      {/* Top Right: Streak & XP 100% (Sunburst #ffd731) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: [8, -10, 8],
          rotate: [10, 15, 10],
        }}
        whileHover={{ scale: 1.12, rotate: 6 }}
        transition={{
          opacity: { duration: 0.5, delay: 0.2 },
          scale: { duration: 0.5, delay: 0.2 },
          y: { duration: 4.8, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 5.4, repeat: Infinity, ease: "easeInOut" },
        }}
        className="hidden sm:flex absolute top-24 right-[6%] lg:right-[12%] items-center gap-2 rounded-[20px] border border-carbon bg-sunburst px-4 py-2.5 text-carbon text-sm font-bold tracking-[0.032em] z-20 cursor-pointer"
      >
        <span className="text-xl">🪙</span>
        <span>Streak &amp; XP 100%</span>
      </motion.div>

      {/* Middle Left: Team 24 · Track 1 (Lavender #e9ccff) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: [-7, 7, -7],
          rotate: [-4, 2, -4],
        }}
        whileHover={{ scale: 1.12, rotate: 0 }}
        transition={{
          opacity: { duration: 0.5, delay: 0.25 },
          scale: { duration: 0.5, delay: 0.25 },
          y: { duration: 3.8, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 4.4, repeat: Infinity, ease: "easeInOut" },
        }}
        className="hidden lg:flex absolute top-80 left-[18%] items-center gap-1.5 rounded-[16px] border border-carbon bg-lavender px-3 py-1.5 text-carbon text-xs font-bold tracking-[0.032em] z-20 cursor-pointer"
      >
        <span>✨</span>
        <span>Team 24 · Track 1</span>
      </motion.div>

      {/* Lower Left: Voice Mock Turn (Voltage Violet #5c4ade) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: [8, -8, 8],
          rotate: [4, 9, 4],
        }}
        whileHover={{ scale: 1.12, rotate: 0 }}
        transition={{
          opacity: { duration: 0.5, delay: 0.3 },
          scale: { duration: 0.5, delay: 0.3 },
          y: { duration: 5.2, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 5.8, repeat: Infinity, ease: "easeInOut" },
        }}
        className="hidden md:flex absolute bottom-36 left-[4%] lg:left-[8%] items-center gap-2 rounded-[16px] border border-carbon bg-voltage-violet px-4 py-2 text-paper-white text-xs font-bold tracking-[0.032em] z-20 cursor-pointer"
      >
        <span className="text-lg">👛</span>
        <span>Voice Mock Turn</span>
      </motion.div>

      {/* Lower Right: Real JD Verified (Mint Pop #55db9c) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: [-8, 8, -8],
          rotate: [-8, -3, -8],
        }}
        whileHover={{ scale: 1.12, rotate: 0 }}
        transition={{
          opacity: { duration: 0.5, delay: 0.35 },
          scale: { duration: 0.5, delay: 0.35 },
          y: { duration: 4.5, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 5.1, repeat: Infinity, ease: "easeInOut" },
        }}
        className="hidden md:flex absolute bottom-44 right-[5%] lg:right-[10%] items-center gap-2 rounded-[20px] border border-carbon bg-mint-pop px-4 py-2 text-carbon text-xs font-bold tracking-[0.032em] z-20 cursor-pointer"
      >
        <span className="text-lg">✓</span>
        <span>Real JD Verified</span>
      </motion.div>

      {/* Background 3D Inflatable Ribbon Sculpture (Electric Blue Graphic) with subtle inflatable drift */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{
          opacity: 0.85,
          scale: [1, 1.02, 1],
          y: [-6, 6, -6],
        }}
        transition={{
          opacity: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
          scale: { duration: 7, repeat: Infinity, ease: "easeInOut" },
          y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
        }}
        className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-[1200px] h-64 pointer-events-none -z-0 overflow-hidden"
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
        {/* Hackathon Badge Pill with Smooth Fade-in & Subtle Float */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{
            opacity: 1,
            y: [-3, 3, -3],
          }}
          whileHover={{ scale: 1.05 }}
          transition={{
            opacity: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
            y: { duration: 3.6, repeat: Infinity, ease: "easeInOut" },
          }}
          className="inline-flex items-center gap-2 rounded-full border border-carbon bg-paper-white px-4 py-1.5 text-xs font-bold tracking-[0.032em] text-carbon mb-6 cursor-pointer"
        >
          <Sparkles className="size-3.5 text-carbon" />
          <span>Global Hackathon 2026 · Team 24</span>
        </motion.div>

        {/* Sculptural Display Headline (Lateral 800) - Fade-in & Slide-up */}
        <motion.h1
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="font-lateral text-[clamp(68px,15vw,220px)] font-extrabold uppercase leading-[0.92] tracking-normal text-carbon text-center"
        >
          JOBLINGO
        </motion.h1>

        {/* Subtitle Line in Lateral Display */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-2 font-lateral text-[clamp(24px,4vw,56px)] font-extrabold uppercase leading-[0.92] text-carbon"
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
              href={isSignedIn ? "/job" : "/register"}
              className="inline-flex items-center gap-2.5 rounded-full border border-carbon bg-carbon px-8 py-4 text-sm font-bold tracking-[0.032em] text-paper-white"
            >
              <span>{isSignedIn ? "Find a Job to Practice" : "Start Practicing Free"}</span>
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

        {/* Mascot Introduction Card: static mascot art + a speech bubble that
            types itself out on a loop, introducing the product like the
            mascot is talking the visitor through it. */}
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -4 }}
          transition={{ duration: 0.55, delay: 0.52, ease: [0.16, 1, 0.3, 1] }}
          className="mt-14 w-full max-w-xl rounded-[30px] border border-carbon bg-paper-white p-6 sm:p-8 text-left text-carbon"
        >
          <div className="relative mb-6 flex items-end justify-center gap-3 rounded-[20px] border border-carbon bg-sky-wash/40 px-4 pt-6 pb-0 overflow-hidden sm:gap-4">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative h-[220px] w-[160px] shrink-0 sm:h-[260px] sm:w-[190px]"
            >
              <Image
                src="/brand/joblingo-mascot.webp"
                alt="Joblingo mascot"
                fill
                sizes="190px"
                className="object-contain object-bottom"
                priority
              />
            </motion.div>

            <div className="mb-8 max-w-[220px] sm:max-w-[260px]">
              <MascotIntroChat />
            </div>
          </div>

          {/* Audio Wave Simulation with Meaningful Context */}
          <div className="rounded-[18px] border border-carbon bg-soft-mist p-4">
            <div className="flex items-center justify-between text-xs font-bold mb-2">
              <span className="text-carbon/80">Spoken English Mock Interview Turn</span>
              <span className="text-carbon uppercase font-extrabold tracking-wider text-[11px]">
                HANDS-FREE · STREAM ACTIVE
              </span>
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
