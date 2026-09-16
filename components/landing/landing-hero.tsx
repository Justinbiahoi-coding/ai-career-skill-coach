import Link from "next/link";
import { ArrowRight, PlayCircle, Sparkles, Mic, CheckCircle2, ShieldCheck } from "lucide-react";
import { Mascot } from "@/components/mascot";

export function LandingHero() {
  return (
    <section
      id="hero"
      className="relative min-h-[92vh] w-full bg-sky-wash px-6 pt-12 pb-24 md:pt-20 md:pb-32 overflow-hidden flex flex-col items-center text-center select-none"
    >
      {/* Floating 2D Multi-Colored Stickers with 1px Hand-cut Black Borders */}
      <div className="hidden sm:flex absolute top-16 left-[5%] lg:left-[10%] -rotate-12 items-center gap-2 rounded-[20px] border border-carbon bg-ember px-4 py-2.5 text-paper-white text-sm font-bold tracking-[0.032em] z-20">
        <span className="text-xl">🚀</span>
        <span>AI Gap Scanner</span>
      </div>

      <div className="hidden sm:flex absolute top-24 right-[6%] lg:right-[12%] rotate-12 items-center gap-2 rounded-[20px] border border-carbon bg-sunburst px-4 py-2.5 text-carbon text-sm font-bold tracking-[0.032em] z-20">
        <span className="text-xl">🪙</span>
        <span>Streak &amp; XP 100%</span>
      </div>

      <div className="hidden md:flex absolute bottom-36 left-[4%] lg:left-[8%] rotate-6 items-center gap-2 rounded-[16px] border border-carbon bg-voltage-violet px-4 py-2 text-paper-white text-xs font-bold tracking-[0.032em] z-20">
        <span className="text-lg">👛</span>
        <span>Voice Mock Turn</span>
      </div>

      <div className="hidden md:flex absolute bottom-44 right-[5%] lg:right-[10%] -rotate-6 items-center gap-2 rounded-[20px] border border-carbon bg-mint-pop px-4 py-2 text-carbon text-xs font-bold tracking-[0.032em] z-20">
        <span className="text-lg">✓</span>
        <span>Real JD Verified</span>
      </div>

      <div className="hidden lg:flex absolute top-80 left-[18%] -rotate-3 items-center gap-1.5 rounded-[16px] border border-carbon bg-lavender px-3 py-1.5 text-carbon text-xs font-bold tracking-[0.032em] z-20">
        <span>✨</span>
        <span>Team 15 · Track 1</span>
      </div>

      {/* Background 3D Inflatable Ribbon Sculpture (Electric Blue Graphic) */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-[1200px] h-64 pointer-events-none -z-0 opacity-90 overflow-hidden">
        <svg
          viewBox="0 0 1000 320"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Back ribbon loop with 3D shaded gradients */}
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
      </div>

      <div className="relative z-10 mx-auto max-w-[1440px] px-4 flex flex-col items-center">
        {/* Hackathon Badge Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-carbon bg-paper-white px-4 py-1.5 text-xs font-bold tracking-[0.032em] text-carbon mb-6">
          <Sparkles className="size-3.5 text-carbon" />
          <span>Global Hackathon 2026 · Team 15</span>
        </div>

        {/* Sculptural Display Headline (Lateral 800 with Crushed 0.78 Leading) */}
        <h1 className="font-lateral text-[clamp(68px,15vw,220px)] font-extrabold uppercase leading-[0.78] tracking-normal text-carbon text-center">
          JOBLINGO
        </h1>

        {/* Subtitle Line in Lateral Display */}
        <div className="mt-2 font-lateral text-[clamp(24px,4vw,56px)] font-extrabold uppercase leading-[0.85] text-carbon">
          CAREER SKILL COACH
        </div>

        {/* Tagline directly under display block */}
        <p className="mt-8 max-w-2xl font-aeonik text-[18px] sm:text-[22px] font-medium leading-[1.3] tracking-[-0.01em] text-carbon">
          Inflatable sticker universe for your career readiness. Scan live job postings from{" "}
          <strong className="underline decoration-carbon underline-offset-4 font-bold">VietnamWorks, ITviec, TopDev</strong>,
          discover your skill gaps, and master hands-free AI voice mock interviews.
        </p>

        {/* Action Buttons: Carbon Filled CTA + Paper White Outlined Ghost */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/home"
            className="inline-flex items-center gap-2.5 rounded-full border border-carbon bg-carbon px-8 py-4 text-sm font-bold tracking-[0.032em] text-paper-white transition-transform hover:scale-105 active:scale-95"
          >
            <span>Start Practicing Free</span>
            <ArrowRight className="size-4.5" />
          </Link>

          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2.5 rounded-full border border-carbon bg-paper-white px-7 py-4 text-sm font-bold tracking-[0.032em] text-carbon transition-transform hover:bg-soft-mist active:scale-95"
          >
            <PlayCircle className="size-4.5 text-carbon" />
            <span>Explore 5-Step Flow</span>
          </a>
        </div>

        {/* Trust Badges in Soft Mist Pills */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm font-bold tracking-[0.02em] text-carbon">
          <div className="inline-flex items-center gap-2 rounded-full border border-carbon bg-paper-white px-4 py-2">
            <CheckCircle2 className="size-4 text-carbon" />
            <span>No Account Required</span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-carbon bg-paper-white px-4 py-2">
            <ShieldCheck className="size-4 text-carbon" />
            <span>100% Real Job Data</span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-carbon bg-paper-white px-4 py-2">
            <Mic className="size-4 text-carbon" />
            <span>Hands-Free Voice Practice</span>
          </div>
        </div>

        {/* Interactive Physical Sticker Preview Card */}
        <div className="mt-14 w-full max-w-xl rounded-[30px] border border-carbon bg-paper-white p-6 sm:p-8 text-left text-carbon">
          {/* Card Header Pill Strip */}
          <div className="flex items-center justify-between pb-4 border-b border-carbon">
            <div className="flex items-center gap-2.5">
              <span className="size-3 rounded-full border border-carbon bg-mint-pop animate-pulse" />
              <span className="text-xs sm:text-sm font-bold tracking-[0.032em]">AI Live Simulation</span>
            </div>
            <span className="rounded-full border border-carbon bg-sunburst px-3 py-1 text-xs font-bold text-carbon">
              Streak: 5 Days 🔥
            </span>
          </div>

          {/* Card Mascot Visual */}
          <div className="relative my-6 flex justify-center items-center py-4 bg-sky-wash/40 rounded-[20px] border border-carbon">
            <Mascot mood="happy" size="lg" priority decorative />

            {/* Overlapping Sticker Badges */}
            <div className="absolute -top-3 -left-3 -rotate-6 rounded-[14px] border border-carbon bg-lavender px-3 py-1 text-xs font-bold">
              ⚡ Gap: System Design
            </div>

            <div className="absolute -bottom-2 -right-3 rotate-6 rounded-[14px] border border-carbon bg-mint-pop px-3 py-1 text-xs font-bold">
              ✓ Score: 9.2/10
            </div>
          </div>

          {/* Audio Wave Simulation */}
          <div className="rounded-[18px] border border-carbon bg-soft-mist p-4">
            <div className="flex items-center justify-between text-xs font-bold mb-2">
              <span className="text-carbon/70">AI Voice Mock Simulation</span>
              <span className="text-carbon uppercase font-extrabold tracking-wider">Active</span>
            </div>
            <div className="flex items-center gap-1.5 h-7 justify-center">
              {[35, 70, 50, 90, 60, 80, 45, 95, 75, 50, 85, 40, 65, 80, 55, 30].map((h, i) => (
                <span
                  key={i}
                  style={{ height: `${h}%` }}
                  className="w-1.5 rounded-full bg-carbon"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
