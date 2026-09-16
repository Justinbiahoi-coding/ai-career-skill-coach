"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";

export function LandingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Overview", href: "#overview" },
    { label: "5-Step Flow", href: "#how-it-works" },
    { label: "Features", href: "#features" },
    { label: "AI Architecture", href: "#ai-spec" },
    { label: "Team", href: "#team" },
  ];

  const marqueeText =
    "JOBLINGO AI • GLOBAL HACKATHON 2026 • AI CAREER SKILL COACH • SKILL GAP DISCOVERY • HANDS-FREE VOICE MOCK INTERVIEW • 5-STEP CLOSED LOOP • ";

  return (
    <div className="sticky top-0 z-50 w-full">
      {/* 1. Slush Marquee Announcement Strip */}
      <div className="w-full overflow-hidden border-b border-carbon bg-carbon py-2 text-paper-white select-none">
        <div className="flex w-max animate-marquee">
          <span className="text-[12px] font-bold uppercase tracking-[0.032em] whitespace-nowrap px-2">
            {marqueeText.repeat(8)}
          </span>
        </div>
      </div>

      {/* 2. Main Pill Navbar Container over Sky Wash ground */}
      <header className="w-full border-b border-carbon bg-sky-wash/95 backdrop-blur-md transition-all">
        <div className="mx-auto flex min-h-[88px] sm:min-h-[96px] w-full max-w-[1440px] items-center justify-between px-6 sm:px-8 lg:px-12 py-3">
          {/* Circular Hand-cut Logo Mark */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="flex size-11 sm:size-12 items-center justify-center rounded-full border border-carbon bg-paper-white text-carbon font-extrabold text-xl font-lateral transition-transform group-hover:rotate-6 group-hover:scale-105">
              J
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-carbon">
                Joblingo
              </span>
              <span className="rounded-full border border-carbon bg-sunburst px-2.5 py-0.5 text-[11px] font-bold text-carbon">
                AI
              </span>
            </div>
          </Link>

          {/* Desktop Pill Navigation */}
          <nav className="hidden lg:flex items-center gap-1 rounded-full border border-carbon bg-paper-white p-1.5">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-full px-4 py-2 text-[13px] font-bold tracking-[0.032em] text-carbon transition-colors hover:bg-soft-mist"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop Action Buttons: Outlined White + Carbon Filled */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              type="button"
              className="cursor-pointer rounded-full border border-carbon bg-paper-white px-5 py-2.5 text-[13px] font-bold tracking-[0.032em] text-carbon transition-colors hover:bg-soft-mist active:scale-95"
              onClick={() => alert("Sign In functionality coming soon...")}
            >
              Sign In
            </button>

            <Link
              href="/home"
              className="inline-flex items-center gap-2 rounded-full border border-carbon bg-carbon px-6 py-2.5 text-[13px] font-bold tracking-[0.032em] text-paper-white transition-transform hover:scale-105 active:scale-95"
            >
              <span>Get Started</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex size-11 items-center justify-center rounded-full border border-carbon bg-paper-white text-carbon hover:bg-soft-mist"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="border-t border-carbon bg-paper-white p-6 lg:hidden">
            <nav className="flex flex-col gap-2.5">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-full border border-carbon bg-soft-mist px-5 py-3 text-sm font-bold tracking-[0.032em] text-carbon hover:bg-sky-wash"
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-4 flex flex-col gap-3 border-t border-carbon pt-4">
                <button
                  type="button"
                  className="w-full rounded-full border border-carbon bg-paper-white py-3 text-center text-sm font-bold tracking-[0.032em] text-carbon hover:bg-soft-mist"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    alert("Sign In functionality coming soon...");
                  }}
                >
                  Sign In
                </button>
                <Link
                  href="/home"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full rounded-full border border-carbon bg-carbon py-3 text-center text-sm font-bold tracking-[0.032em] text-paper-white"
                >
                  Get Started
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>
    </div>
  );
}
