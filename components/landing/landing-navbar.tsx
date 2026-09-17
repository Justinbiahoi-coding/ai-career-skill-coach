"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ClipboardList,
  Flame,
  GraduationCap,
  LogOut,
  Menu,
  PlayCircle,
  Trophy,
  Search,
  User,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { createClient } from "@/lib/supabase/client";
import { getMyProfile } from "@/lib/profile";
import { getLevelProgress } from "@/lib/leveling";
import type { Gender, Profile } from "@/lib/types";
import { cn } from "cn";

const AVATAR_ICON: Record<Gender, typeof User> = {
  male: User,
  female: UserRound,
  other: Users,
};

const AVATAR_STICKER: Record<Gender, string> = {
  male: "bg-sky-wash",
  female: "bg-lavender",
  other: "bg-mint-pop",
};

const MARKETING_LINKS = [
  { label: "Overview", href: "#overview" },
  { label: "5-Step Flow", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "AI Architecture", href: "#ai-spec" },
  { label: "Team", href: "#team" },
] as const;

// Signed-in visitors get real destinations instead of marketing anchors —
// this is the app's only top-level navigation now that /home was folded
// into /, so it has to reach every core area, not just describe them.
//
// Four independent areas, not five linear steps: Find Job only searches and
// saves, Practice (/gap) is where analysis + lessons actually happen, Mock
// Test (/mock-test) is its own entry point rather than something unlocked
// only by finishing Practice first, and Courses (/courses) is a standalone
// lookup tool — real YouTube search results per skill, not a step in the
// practice flow. /learn and /interview are still real routes, but they're
// reached *from* Practice/Mock Test, not from here.
//
// How it Works / About Team don't have their own app-side pages — they're
// sections of the landing page (see landing-how-it-works.tsx,
// landing-team.tsx) — so signed-in users are sent back to "/" with the
// anchor rather than getting a duplicate page just for this nav item.
const APP_LINKS = [
  { label: "Find Job", href: "/job", icon: Search },
  { label: "Practice", href: "/gap", icon: ClipboardList },
  { label: "Mock Test", href: "/mock-test", icon: Trophy },
  { label: "Courses", href: "/courses", icon: GraduationCap },
  { label: "How it Works", href: "/#how-it-works", icon: PlayCircle },
  { label: "About Team", href: "/#team", icon: Users },
] as const;

export interface LandingNavbarProps {
  /** Signed-in user's email, or null/undefined when signed out. */
  userEmail?: string | null;
}

export function LandingNavbar({ userEmail }: LandingNavbarProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [levelPopoverOpen, setLevelPopoverOpen] = useState(false);
  const identityPillRef = useRef<HTMLDivElement>(null);
  const isSignedIn = Boolean(userEmail);

  useEffect(() => {
    if (!levelPopoverOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (identityPillRef.current && !identityPillRef.current.contains(e.target as Node)) {
        setLevelPopoverOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [levelPopoverOpen]);

  useEffect(() => {
    if (!isSignedIn) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProfile(null);
      return;
    }
    getMyProfile()
      .then(setProfile)
      .catch(() => setProfile(null));
  }, [isSignedIn]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setMobileMenuOpen(false);
    router.push("/");
    // Drops the server's cached render of this page, which still holds the
    // signed-in user; without it the old landing-as-hub view survives the
    // navigation and getUser() below still reports signed in.
    router.refresh();
  }

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
              className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-carbon bg-paper-white sm:size-12"
            >
              <Image
                src="/brand/joblingo-logo.webp"
                alt="Joblingo"
                fill
                sizes="48px"
                className="object-cover"
                priority
              />
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

          {/* Desktop Pill Navigation — anchors when signed out, real routes when signed in */}
          <nav className="hidden lg:flex items-center gap-1 rounded-full border border-carbon bg-paper-white p-1.5">
            {isSignedIn
              ? APP_LINKS.map((link) => (
                  <motion.div
                    key={link.href}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <Link
                      href={link.href}
                      className="flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-bold tracking-[0.032em] text-carbon transition-colors hover:bg-soft-mist"
                    >
                      <link.icon className="size-4" aria-hidden="true" />
                      {link.label}
                    </Link>
                  </motion.div>
                ))
              : MARKETING_LINKS.map((link) => (
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
            {isSignedIn ? (
              <>
                {/* Identity pill: streak (left) — avatar (center) — name (right).
                    Sits left of Sign Out so the two never compete for the
                    same corner; hidden until the profile actually loads so
                    it never flashes an empty shell. */}
                {profile && (
                  <motion.div
                    ref={identityPillRef}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="relative flex items-center gap-2 rounded-full border border-carbon bg-paper-white py-1.5 pr-4 pl-2.5"
                  >
                    <span
                      className={cn(
                        "flex items-center gap-1 font-aeonik text-xs font-extrabold tabular-nums",
                        profile.streakDays > 0 ? "text-carbon" : "text-carbon/40"
                      )}
                    >
                      <Flame
                        className={cn("size-4", profile.streakDays > 0 ? "text-ember" : "text-carbon/30")}
                        aria-hidden="true"
                      />
                      {profile.streakDays}
                    </span>

                    {/* Level badge: click toggles a popover with the full XP
                        progress bar rather than showing that bar inline —
                        the navbar has no spare width for it once 6 nav links
                        are already in play. */}
                    <button
                      type="button"
                      onClick={() => setLevelPopoverOpen((v) => !v)}
                      className="cursor-pointer rounded-full border border-carbon bg-sunburst px-2 py-0.5 font-aeonik text-[11px] font-extrabold text-carbon"
                      aria-expanded={levelPopoverOpen}
                      aria-label={`Level ${getLevelProgress(profile.xp).level}, view XP progress`}
                    >
                      Lv.{getLevelProgress(profile.xp).level}
                    </button>

                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-carbon",
                        AVATAR_STICKER[profile.gender ?? "other"]
                      )}
                    >
                      {(() => {
                        const AvatarIcon = AVATAR_ICON[profile.gender ?? "other"];
                        return <AvatarIcon className="size-4.5 text-carbon" aria-hidden="true" />;
                      })()}
                    </span>
                    {profile.fullName && (
                      <span className="font-aeonik text-[13px] font-extrabold text-carbon">
                        {profile.fullName}
                      </span>
                    )}

                    <AnimatePresence>
                      {levelPopoverOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -6, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -6, scale: 0.96 }}
                          transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                          className="absolute top-full right-0 mt-2 w-56 rounded-[20px] border border-carbon bg-paper-white p-4 shadow-lg"
                        >
                          {(() => {
                            const { level, xpIntoLevel, xpForNextLevel, progressRatio } = getLevelProgress(
                              profile.xp
                            );
                            return (
                              <div className="flex flex-col gap-2">
                                <div className="flex items-baseline justify-between">
                                  <span className="font-aeonik text-sm font-extrabold text-carbon">
                                    Level {level}
                                  </span>
                                  <span className="font-aeonik text-[11px] font-bold tabular-nums text-carbon/60">
                                    {xpIntoLevel} / {xpForNextLevel} XP
                                  </span>
                                </div>
                                <div className="h-2.5 w-full overflow-hidden rounded-full border border-carbon bg-soft-mist">
                                  <div
                                    className="h-full rounded-full bg-sunburst transition-[width] duration-500 ease-out"
                                    style={{ width: `${Math.min(progressRatio, 1) * 100}%` }}
                                  />
                                </div>
                                <span className="font-aeonik text-[11px] font-medium text-carbon/60">
                                  {xpForNextLevel - xpIntoLevel} XP to Level {level + 1}
                                </span>
                              </div>
                            );
                          })()}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}

                <motion.button
                  type="button"
                  onClick={handleSignOut}
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-carbon bg-paper-white px-5 py-2.5 text-[13px] font-bold tracking-[0.032em] text-carbon transition-colors hover:bg-soft-mist"
                >
                  <LogOut className="size-4" aria-hidden="true" />
                  Sign Out
                </motion.button>
              </>
            ) : (
              <>
                <motion.div
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Link
                    href="/login"
                    className="inline-flex cursor-pointer rounded-full border border-carbon bg-paper-white px-5 py-2.5 text-[13px] font-bold tracking-[0.032em] text-carbon transition-colors hover:bg-soft-mist"
                  >
                    Sign In
                  </Link>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 rounded-full border border-carbon bg-carbon px-6 py-2.5 text-[13px] font-bold tracking-[0.032em] text-paper-white"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="size-4" />
                  </Link>
                </motion.div>
              </>
            )}
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
                {isSignedIn && profile && (
                  <div className="mb-1 flex flex-col gap-2.5 rounded-[20px] border border-carbon bg-soft-mist p-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "flex items-center gap-1 font-aeonik text-xs font-extrabold tabular-nums",
                          profile.streakDays > 0 ? "text-carbon" : "text-carbon/40"
                        )}
                      >
                        <Flame
                          className={cn("size-4", profile.streakDays > 0 ? "text-ember" : "text-carbon/30")}
                          aria-hidden="true"
                        />
                        {profile.streakDays}
                      </span>
                      <span
                        className={cn(
                          "flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-carbon",
                          AVATAR_STICKER[profile.gender ?? "other"]
                        )}
                      >
                        {(() => {
                          const AvatarIcon = AVATAR_ICON[profile.gender ?? "other"];
                          return <AvatarIcon className="size-4.5 text-carbon" aria-hidden="true" />;
                        })()}
                      </span>
                      {profile.fullName && (
                        <span className="font-aeonik text-[13px] font-extrabold text-carbon">
                          {profile.fullName}
                        </span>
                      )}
                    </div>

                    {/* Mobile has room for the full XP bar inline — no need
                        for the desktop popover's click-to-reveal pattern. */}
                    {(() => {
                      const { level, xpIntoLevel, xpForNextLevel, progressRatio } = getLevelProgress(profile.xp);
                      return (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-baseline justify-between">
                            <span className="font-aeonik text-xs font-extrabold text-carbon">Level {level}</span>
                            <span className="font-aeonik text-[10px] font-bold tabular-nums text-carbon/60">
                              {xpIntoLevel} / {xpForNextLevel} XP
                            </span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full border border-carbon bg-paper-white">
                            <div
                              className="h-full rounded-full bg-sunburst transition-[width] duration-500 ease-out"
                              style={{ width: `${Math.min(progressRatio, 1) * 100}%` }}
                            />
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
                {isSignedIn
                  ? APP_LINKS.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2 rounded-full border border-carbon bg-soft-mist px-5 py-3 text-sm font-bold tracking-[0.032em] text-carbon hover:bg-sky-wash transition-colors"
                      >
                        <link.icon className="size-4" aria-hidden="true" />
                        {link.label}
                      </Link>
                    ))
                  : MARKETING_LINKS.map((link) => (
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
                  {isSignedIn ? (
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="flex w-full items-center justify-center gap-2 rounded-full border border-carbon bg-paper-white py-3 text-center text-sm font-bold tracking-[0.032em] text-carbon hover:bg-soft-mist"
                    >
                      <LogOut className="size-4" aria-hidden="true" />
                      Sign Out
                    </button>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full rounded-full border border-carbon bg-paper-white py-3 text-center text-sm font-bold tracking-[0.032em] text-carbon hover:bg-soft-mist inline-block"
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full rounded-full border border-carbon bg-carbon py-3 text-center text-sm font-bold tracking-[0.032em] text-paper-white inline-block"
                      >
                        Get Started
                      </Link>
                    </>
                  )}
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </div>
  );
}
