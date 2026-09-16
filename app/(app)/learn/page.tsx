"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import {
  ArrowRight,
  BookOpen,
  Check,
  ListChecks,
  ListOrdered,
  Loader2,
  MessageCircle,
  MessagesSquare,
  PenLine,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { cn } from "cn";
import { listSkillCardProgressForJob } from "@/lib/saved-jobs";
import {
  loadActiveJobId,
  loadCompletedCardsForSkill,
  loadExtractedSkills,
  loadSelectedGap,
} from "@/lib/session-store";
import { GRADEABLE_CARD_KINDS } from "@/lib/types";
import type { PracticeCardKind } from "@/lib/types";

interface RoomContext {
  skillName: string;
  jdText: string;
  jobId: string | null;
}

interface CardDef {
  kind: PracticeCardKind;
  title: string;
  description: string;
  icon: typeof BookOpen;
  itemCount: number | null;
  href: Route;
  sticker: string;
}

const CARD_DEFS: CardDef[] = [
  {
    kind: "knowledge",
    title: "Knowledge",
    description: "Read the background before you drill — skip it if you already know this skill.",
    icon: BookOpen,
    itemCount: null,
    href: "/learn/knowledge",
    sticker: "bg-soft-mist",
  },
  {
    kind: "multiple_choice",
    title: "Multiple Choice",
    description: "Quick concept checks, 4 options each.",
    icon: ListChecks,
    itemCount: 5,
    href: "/learn/multiple-choice",
    sticker: "bg-sky-wash",
  },
  {
    kind: "fill_blank",
    title: "Fill in the Blank",
    description: "Complete the sentence with the right term.",
    icon: PenLine,
    itemCount: 5,
    href: "/learn/fill-blank",
    sticker: "bg-lavender",
  },
  {
    kind: "reorder",
    title: "Reorder Steps",
    description: "Put a real process back in the correct order.",
    icon: ListOrdered,
    itemCount: 4,
    href: "/learn/reorder",
    sticker: "bg-sunburst",
  },
  {
    kind: "free_text",
    title: "Free Response",
    description: "Answer realistic scenarios in your own words, graded by AI.",
    icon: PenLine,
    itemCount: 4,
    href: "/learn/free-text",
    sticker: "bg-mint-pop",
  },
  {
    kind: "mini_dialogue",
    title: "Mini Dialogue",
    description: "Short back-and-forth exchanges, like a slice of a real interview.",
    icon: MessageCircle,
    itemCount: 4,
    href: "/learn/mini-dialogue",
    sticker: "bg-voltage-violet text-paper-white",
  },
  {
    kind: "mixed",
    title: "Mixed Drill",
    description: "A longer, comprehensive set spanning every question style.",
    icon: MessagesSquare,
    itemCount: 15,
    href: "/learn/mixed",
    sticker: "bg-ember text-paper-white",
  },
];

export default function PracticeRoomPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null | undefined>(undefined);
  const [context, setContext] = useState<RoomContext | null>(null);
  const [checkedStorage, setCheckedStorage] = useState(false);
  const [completedCards, setCompletedCards] = useState<string[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null));

    const selectedGap = loadSelectedGap();
    const extracted = loadExtractedSkills();
    const jobId = loadActiveJobId();

    const nextContext =
      selectedGap && extracted
        ? { skillName: selectedGap.skill.name, jdText: extracted.jdText, jobId }
        : null;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setContext(nextContext);
    setCheckedStorage(true);

    if (!nextContext) return;

    if (nextContext.jobId) {
      setLoadingProgress(true);
      listSkillCardProgressForJob(nextContext.jobId)
        .then((rows) => {
          const row = rows.find((r) => r.skillName === nextContext.skillName);
          setCompletedCards(row?.completedCards ?? []);
        })
        .catch(() => setCompletedCards([]))
        .finally(() => setLoadingProgress(false));
    } else {
      setCompletedCards(loadCompletedCardsForSkill(nextContext.skillName));
    }
  }, []);

  if (checkedStorage && !context) {
    return (
      <div className="flex min-h-screen flex-col bg-sky-wash">
        <LandingNavbar userEmail={userEmail} />
        <main className="mx-auto flex w-full max-w-[860px] flex-1 flex-col items-center justify-center gap-4 px-5 py-12 text-center">
          <p className="font-aeonik text-base font-medium text-carbon/80">
            No skill picked for this session yet. Let&apos;s go back and choose one.
          </p>
          <Button
            size="lg"
            className="h-12 rounded-full border border-carbon bg-carbon font-aeonik font-bold text-paper-white hover:bg-carbon/85"
            onClick={() => router.push("/gap")}
          >
            Back to skill breakdown
          </Button>
        </main>
      </div>
    );
  }

  if (!context) {
    return (
      <div className="flex min-h-screen flex-col bg-sky-wash">
        <LandingNavbar userEmail={userEmail} />
        <main className="mx-auto flex w-full max-w-[860px] flex-1 items-center justify-center px-5 py-16">
          <p className="font-aeonik text-sm font-medium text-carbon/60">Loading...</p>
        </main>
      </div>
    );
  }

  const gradeableDone = CARD_DEFS.filter(
    (c) => c.kind !== "knowledge" && completedCards.includes(c.kind)
  ).length;
  const allGradeableDone = gradeableDone >= GRADEABLE_CARD_KINDS.length;

  return (
    <div className="flex min-h-screen flex-col bg-sky-wash">
      <LandingNavbar userEmail={userEmail} />

      <main className="mx-auto flex w-full max-w-[900px] flex-1 flex-col gap-8 px-5 py-12 sm:px-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex w-fit items-center gap-2 rounded-full border border-carbon bg-paper-white px-4 py-1.5 text-xs font-bold tracking-[0.032em] text-carbon"
            >
              <Sparkles className="size-3.5" aria-hidden="true" />
              PRACTICE ROOM
            </motion.div>
            <span className="rounded-full border border-carbon bg-electric-blue px-3 py-1 font-aeonik text-xs font-bold text-paper-white">
              {context.skillName}
            </span>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="font-lateral text-[clamp(28px,5vw,44px)] font-extrabold uppercase leading-[0.85] tracking-normal text-carbon"
          >
            Pick a card
          </motion.h1>

          <p className="max-w-lg font-aeonik text-[15px] font-medium leading-relaxed text-carbon/80">
            {allGradeableDone
              ? "You've finished every card for this skill — nice work. Head back to see your other skills, or take on the mixed drill again for review."
              : "Knowledge is optional reading; the other six count toward this skill's progress."}
          </p>
        </div>

        {loadingProgress ? (
          <div className="flex items-center gap-2 py-2 font-aeonik text-sm font-medium text-carbon/60">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Loading your progress...
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 rounded-[20px] border border-carbon bg-paper-white p-4">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-aeonik text-sm font-bold text-carbon">Cards completed</span>
              <span className="font-aeonik text-xs font-extrabold tabular-nums text-carbon/60">
                {gradeableDone} of {GRADEABLE_CARD_KINDS.length}
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full border border-carbon bg-soft-mist">
              <div
                className="h-full rounded-full bg-mint-pop transition-[width] duration-500 ease-out"
                style={{ width: `${(gradeableDone / GRADEABLE_CARD_KINDS.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {CARD_DEFS.map((card, i) => {
            const isDone = completedCards.includes(card.kind);
            const Icon = card.icon;
            return (
              <motion.button
                key={card.kind}
                type="button"
                onClick={() => router.push(card.href)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4, scale: 1.015 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.35, delay: Math.min(i * 0.05, 0.3), ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  "flex cursor-pointer flex-col gap-2.5 rounded-[30px] border border-carbon p-6 text-left",
                  isDone ? "bg-mint-pop/30" : card.sticker
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      "flex size-10 items-center justify-center rounded-full border border-carbon",
                      isDone ? "bg-mint-pop text-carbon" : "bg-paper-white text-carbon"
                    )}
                  >
                    {isDone ? (
                      <Check className="size-5" aria-hidden="true" />
                    ) : (
                      <Icon className="size-5" aria-hidden="true" />
                    )}
                  </span>
                  {card.itemCount && (
                    <span className="rounded-full border border-carbon bg-paper-white px-2.5 py-0.5 font-aeonik text-[10px] font-bold text-carbon">
                      {card.itemCount} items
                    </span>
                  )}
                  {card.kind === "knowledge" && (
                    <span className="rounded-full border border-carbon bg-paper-white px-2.5 py-0.5 font-aeonik text-[10px] font-bold text-carbon">
                      Optional
                    </span>
                  )}
                </div>
                <span className="font-aeonik text-lg font-extrabold text-carbon">{card.title}</span>
                <p className="font-aeonik text-xs leading-relaxed text-carbon/70">{card.description}</p>
              </motion.button>
            );
          })}
        </div>

        <Button
          size="lg"
          variant="outline"
          className="h-12 rounded-full border border-carbon bg-paper-white font-aeonik font-bold text-carbon hover:bg-soft-mist"
          onClick={() => router.push("/gap")}
        >
          <ArrowRight className="size-5 rotate-180" aria-hidden="true" />
          Back to skill breakdown
        </Button>
      </main>
    </div>
  );
}
