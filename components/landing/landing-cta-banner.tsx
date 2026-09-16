import Link from "next/link";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

export function LandingCtaBanner() {
  return (
    <section className="w-full bg-concrete-gray py-20 md:py-28 px-6 sm:px-8 lg:px-12 select-none">
      <div className="mx-auto max-w-[1440px]">
        {/* Giant Electric Blue Slush Card with Hand-cut 1px Black Border & 40px Radius */}
        <div className="relative rounded-[40px] border border-carbon bg-electric-blue p-10 sm:p-16 md:p-20 text-center text-carbon overflow-hidden">
          {/* Floating Sticker Confetti */}
          <div className="hidden sm:flex absolute top-8 left-8 -rotate-12 rounded-[18px] border border-carbon bg-ember px-3.5 py-1.5 text-xs font-bold text-paper-white">
            🚀 Ready for Offer
          </div>
          <div className="hidden sm:flex absolute top-8 right-8 rotate-12 rounded-[18px] border border-carbon bg-sunburst px-3.5 py-1.5 text-xs font-bold text-carbon">
            🪙 100% Free
          </div>
          <div className="hidden sm:flex absolute bottom-8 left-12 rotate-6 rounded-[18px] border border-carbon bg-mint-pop px-3.5 py-1.5 text-xs font-bold text-carbon">
            ✓ Real Mock Turns
          </div>
          <div className="hidden sm:flex absolute bottom-8 right-12 -rotate-6 rounded-[18px] border border-carbon bg-lavender px-3.5 py-1.5 text-xs font-bold text-carbon">
            ⚡ Zero Delay
          </div>

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

            {/* Action Buttons: Carbon Filled CTA + Paper White Outlined Ghost Button */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/home"
                className="inline-flex items-center gap-2.5 rounded-full border border-carbon bg-carbon px-8 py-4 text-base font-bold tracking-[0.032em] text-paper-white transition-transform hover:scale-105 active:scale-95"
              >
                <span>Start Practicing Free</span>
                <ArrowRight className="size-5" />
              </Link>

              <Link
                href="/gap"
                className="inline-flex items-center gap-2.5 rounded-full border border-carbon bg-paper-white px-8 py-4 text-base font-bold tracking-[0.032em] text-carbon transition-transform hover:bg-soft-mist active:scale-95"
              >
                <span>Scan Job Postings</span>
              </Link>
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
        </div>
      </div>
    </section>
  );
}
