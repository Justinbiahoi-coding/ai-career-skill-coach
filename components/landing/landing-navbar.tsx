"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

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
            <motion.div
              whileHover={{ rotate: 10, scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="flex size-11 sm:size-12 items-center justify-center rounded-full border border-carbon bg-paper-white text-carbon font-extrabold text-xl font-lateral"
            >
              J
            </motion.div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-carbon">
                Joblingo
              </span>
              <motion.span
                whileHover={{ scale: 1.1, rotate: -4 }}
                className="rounded-full border border-carbon bg-sunburst px-2.5 py-0.5 text-[11px] font-bold text-carbon inline-block"
              >
                AI
              </motion.span>
            </div>
          </Link>

          {/* Desktop Pill Navigation */}
          <nav className="hidden lg:flex items-center gap-1 rounded-full border border-carbon bg-paper-white p-1.5">
            {navLinks.map((link) => (
              <motion.a
                key={link.href}
                href={link.href}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="rounded-full px-4 py-2 text-[13px] font-bold tracking-[0.032em] text-carbon transition-colors hover:bg-soft-mist"
              >
                {link.label}
              </motion.a>
            ))}
          </nav>

          {/* Desktop Action Buttons: Outlined White + Carbon Filled */}
          <div className="hidden sm:flex items-center gap-3">
            <motion.button
              type="button"
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="cursor-pointer rounded-full border border-carbon bg-paper-white px-5 py-2.5 text-[13px] font-bold tracking-[0.032em] text-carbon transition-colors hover:bg-soft-mist"
              onClick={() => alert("Sign In functionality coming soon...")}
            >
              Sign In
            </motion.button>

            <motion.div
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <Link
                href="/home"
                className="inline-flex items-center gap-2 rounded-full border border-carbon bg-carbon px-6 py-2.5 text-[13px] font-bold tracking-[0.032em] text-paper-white"
              >
                <span>Get Started</span>
                <ArrowRight className="size-4" />
              </Link>
            </motion.div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex lg:hidden">
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex size-11 items-center justify-center rounded-full border border-carbon bg-paper-white text-carbon hover:bg-soft-mist"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="border-t border-carbon bg-paper-white p-6 lg:hidden overflow-hidden"
            >
              <nav className="flex flex-col gap-2.5">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-full border border-carbon bg-soft-mist px-5 py-3 text-sm font-bold tracking-[0.032em] text-carbon hover:bg-sky-wash transition-colors"
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
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </div>
  );
}
