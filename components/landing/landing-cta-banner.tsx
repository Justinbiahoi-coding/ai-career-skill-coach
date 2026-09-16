"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

export interface LandingCtaBannerProps {
  /** Signed-in visitors skip sign-up and go straight into the tool. */
  isSignedIn?: boolean;
}

export function LandingCtaBanner({ isSignedIn = false }: LandingCtaBannerProps) {
  return (
    <section className="w-full bg-concrete-gray py-20 md:py-28 px-6 sm:px-8 lg:px-12 select-none">
      <div className="mx-auto max-w-[1440px]">
        {/* Giant Electric Blue Slush Card with Scroll Reveal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 32 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-[40px] border border-carbon bg-electric-blue p-10 sm:p-16 md:p-20 text-center text-carbon overflow-hidden"
        >
          {/* Floating Sticker Confetti with Continuous Float & Hover Pop */}
          <motion.div
            animate={{
              y: [-6, 6, -6],
              rotate: [-14, -10, -14],
            }}
            whileHover={{ scale: 1.15, rotate: 0 }}
            transition={{
              duration: 4.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="hidden sm:flex absolute top-8 left-8 rounded-[18px] border border-carbon bg-ember px-3.5 py-1.5 text-xs font-bold text-paper-white cursor-pointer select-none"
          >
            🚀 Ready for Offer
          </motion.div>
          <motion.div
            animate={{
              y: [6, -6, 6],
              rotate: [10, 15, 10],
            }}
            whileHover={{ scale: 1.15, rotate: 0 }}
            transition={{
              duration: 4.6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="hidden sm:flex absolute top-8 right-8 rounded-[18px] border border-carbon bg-sunburst px-3.5 py-1.5 text-xs font-bold text-carbon cursor-pointer select-none"
          >
            🪙 100% Free
          </motion.div>
          <motion.div
            animate={{
              y: [-5, 5, -5],
              rotate: [4, 8, 4],
            }}
            whileHover={{ scale: 1.15, rotate: 0 }}
            transition={{
              duration: 3.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="hidden sm:flex absolute bottom-8 left-12 rounded-[18px] border border-carbon bg-mint-pop px-3.5 py-1.5 text-xs font-bold text-carbon cursor-pointer select-none"
          >
            ✓ Real Mock Turns
          </motion.div>
          <motion.div
            animate={{
              y: [5, -5, 5],
              rotate: [-8, -4, -8],
            }}
            whileHover={{ scale: 1.15, rotate: 0 }}
            transition={{
              duration: 4.0,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="hidden sm:flex absolute bottom-8 right-12 rounded-[18px] border border-carbon bg-lavender px-3.5 py-1.5 text-xs font-bold text-carbon cursor-pointer select-none"
          >
            ⚡ Zero Delay
          </motion.div>

          <div className="relative z-10 mx-auto max-w-3xl flex flex-col items-center">
            {/* Hackathon Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-carbon bg-paper-white px-4 py-1.5 text-xs font-bold tracking-[0.032em] text-carbon mb-6">
              <Sparkles className="size-3.5 text-carbon" />
              <span>GET STARTED IN 30 SECONDS</span>
            </div>

            {/* Giant Crushed Lateral Display Headline */}
            <h2 className="font-lateral text-[clamp(44px,8vw,110px)] font-extrabold uppercase leading-[0.78] tracking-normal text-carbon">
              START TODAY
            </h2>

            <p className="mt-6 max-w-xl font-aeonik text-lg sm:text-2xl font-medium leading-[1.3] text-carbon">
              Don&apos;t let knowledge gaps hold back your career. Discover what recruiters expect and master live voice interview reflexes today.
            </p>

            {/* Action Buttons: Carbon Filled CTA + Paper White Outlined Ghost Button with Spring Hovers */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <Link
                  href={isSignedIn ? "/job" : "/register"}
                  className="inline-flex items-center gap-2.5 rounded-full border border-carbon bg-carbon px-8 py-4 text-base font-bold tracking-[0.032em] text-paper-white"
                >
                  <span>{isSignedIn ? "Find a Job to Practice" : "Start Practicing Free"}</span>
                  <ArrowRight className="size-5" />
                </Link>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                {/* /job, not /gap: the gap screen has nothing to show until a
                    job has actually been analyzed, so sending someone
                    straight there lands them on an empty state. */}
                <Link
                  href="/job"
                  className="inline-flex items-center gap-2.5 rounded-full border border-carbon bg-paper-white px-8 py-4 text-base font-bold tracking-[0.032em] text-carbon hover:bg-soft-mist transition-colors"
                >
                  <span>Scan Job Postings</span>
                </Link>
              </motion.div>
            </div>

            {/* Trust Points */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm font-bold tracking-[0.02em] text-carbon">
              <div className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-carbon" />
                <span>No Credit Card Required</span>
              </div>
              <div className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-carbon" />
                <span>Instant Browser Access</span>
              </div>
              <div className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-carbon" />
                <span>Free for Students</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
