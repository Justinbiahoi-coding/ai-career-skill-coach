"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Building2,
  ClipboardPaste,
  Dumbbell,
  GraduationCap,
  Heart,
  Loader2,
  Lock,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { cn } from "cn";
import { listSavedJobs, listSkillCardProgressForJob, updateJobSkills } from "@/lib/saved-jobs";
import { saveExtractedSkills, saveSelectedGap } from "@/lib/session-store";
import { GRADEABLE_CARD_KINDS } from "@/lib/types";
import type {
  ExtractSkillsResult,
  SavedJob,
  Skill,
  SkillCardProgress,
  SkillImportance,
} from "@/lib/types";

const IMPORTANCE_WEIGHT: Record<SkillImportance, number> = { high: 3, medium: 2, low: 1 };
const DEFAULT_RATING = 3;
const MIN_JD_LENGTH = 40;
const RATING_LABELS = ["No idea", "Shaky", "Okay", "Solid", "Strong"] as const;
const IMPORTANCE_STICKER: Record<SkillImportance, string> = {
  high: "bg-ember text-paper-white",
  medium: "bg-sunburst",
  low: "bg-soft-mist",
};

// Gap score: quan trọng cao + tự tin thấp -> điểm cao -> đáng lo hơn. Used
// only to pick which skill is highlighted as the biggest gap on the
// overview screen — it's a hint, not a gate on what the student can enter.
function gapScore(skill: Skill, rating: number): number {
  return IMPORTANCE_WEIGHT[skill.importance] * (6 - rating);
}

function percentComplete(progress: SkillCardProgress | undefined): number {
  const done = progress?.completedCards.length ?? 0;
  return Math.round((done / GRADEABLE_CARD_KINDS.length) * 100);
}

type Screen = "pickJob" | "rate" | "overview";

/**
 * Practice is the analysis boundary: Find Job only ever writes a bare saved
 * row (skills: null), and this page is the one place that spends a Gemini
 * call turning a JD into skills — either for a job picked from the saved
 * list, or for one pasted straight in below.
 *
 * Three screens, not steps in a form: pick/analyze a job, rate confidence on
 * every skill, then an overview of every skill's % complete with a door into
 * that skill's Practice Room. Entering a room is never gated on the rating —
 * the rating only decides which skill gets called out as the biggest gap.
 *
 * Styled to the Slush system (see DESIGN.md) — same carbon-outlined, sticker
 * language as /job, with LandingNavbar instead of the old JourneyBar.
 */
export default function GapPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null | undefined>(undefined);

  // Screen 1: saved-jobs list + picker.
  const [savedJobs, setSavedJobs] = useState<SavedJob[] | null>(null);
  const [jobsError, setJobsError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<SavedJob | null>(null);
  const [showPasteBox, setShowPasteBox] = useState(false);
  const [pastedJd, setPastedJd] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  // Once analyzed: the working session (jdText + skills), same shape either path produces.
  const [session, setSession] = useState<{ jdText: string; skills: Skill[]; jobId: string | null } | null>(
    null
  );
  const [screen, setScreen] = useState<Screen>("pickJob");

  // Screen 2: confidence ratings.
  const [ratings, setRatings] = useState<Record<string, number>>({});

  // Screen 3: per-skill, per-card completion for the current job. Empty for
  // a pasted JD that was never saved — nothing to load, every skill is 0%.
  const [cardProgress, setCardProgress] = useState<Record<string, SkillCardProgress>>({});

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null));

    listSavedJobs()
      .then(setSavedJobs)
      .catch(() => setJobsError("Couldn't load your saved jobs. You can still paste a JD below."));
  }, []);

  function loadCardProgress(jobId: string | null) {
    if (!jobId) {
      setCardProgress({});
      return;
    }
    listSkillCardProgressForJob(jobId)
      .then((rows) => {
        const byName: Record<string, SkillCardProgress> = {};
        for (const row of rows) byName[row.skillName] = row;
        setCardProgress(byName);
      })
      .catch(() => setCardProgress({}));
  }

  async function analyzeJd(jdText: string, jobId: string | null) {
    setAnalyzing(true);
    setAnalyzeError(null);
    try {
      const res = await fetch("/api/extract-skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jdText }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Request failed");
      }
      const data: ExtractSkillsResult = await res.json();
      if (jobId) {
        // Fire-and-forget-ish, but we do want to know if it fails since the
        // job would otherwise silently stay unanalyzed next visit — still
        // non-blocking for the practice flow itself.
        void updateJobSkills(jobId, data.skills).catch(() => {});
      }
      setSession({ jdText, skills: data.skills, jobId });
      saveExtractedSkills({ jdText, skills: data.skills }, jobId);
      loadCardProgress(jobId);
      setScreen("rate");
    } catch {
      setAnalyzeError("Couldn't analyze this job description. Try again in a moment.");
    } finally {
      setAnalyzing(false);
    }
  }

  function handlePickJob(job: SavedJob) {
    setSelectedJob(job);
    setShowPasteBox(false);
    if (job.skills) {
      setSession({ jdText: job.jdText, skills: job.skills, jobId: job.id });
      saveExtractedSkills({ jdText: job.jdText, skills: job.skills }, job.id);
      loadCardProgress(job.id);
      setScreen("rate");
    } else {
      void analyzeJd(job.jdText, job.id);
    }
  }

  function handleAnalyzePasted() {
    const jdText = pastedJd.trim();
    if (jdText.length < MIN_JD_LENGTH) return;
    setSelectedJob(null);
    void analyzeJd(jdText, null);
  }

  function handleChangeJob() {
    setSession(null);
    setScreen("pickJob");
    setSelectedJob(null);
    setAnalyzeError(null);
    setRatings({});
    setCardProgress({});
  }

  const biggestGapSkill = useMemo(() => {
    if (!session) return null;
    let best: Skill | null = null;
    let bestScore = -Infinity;
    for (const skill of session.skills) {
      const score = gapScore(skill, ratings[skill.name] ?? DEFAULT_RATING);
      if (score > bestScore) {
        bestScore = score;
        best = skill;
      }
    }
    return best;
  }, [session, ratings]);

  function handleRate(skillName: string, rating: number) {
    setRatings((prev) => ({ ...prev, [skillName]: rating }));
  }

  function handleEnterRoom(skill: Skill) {
    saveSelectedGap({ skill, confidenceRating: ratings[skill.name] ?? DEFAULT_RATING });
    router.push("/learn");
  }

  // --- Screen 1: pick a saved job, or paste a JD directly ---
  if (screen === "pickJob" || !session) {
    return (
      <div className="flex min-h-screen flex-col bg-sky-wash">
        <LandingNavbar userEmail={userEmail} />

        <main className="mx-auto flex w-full max-w-[860px] flex-1 flex-col gap-8 px-5 py-12 sm:px-8">
          <div className="flex flex-col gap-4">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex w-fit items-center gap-2 rounded-full border border-carbon bg-paper-white px-4 py-1.5 text-xs font-bold tracking-[0.032em] text-carbon"
            >
              <Sparkles className="size-3.5" aria-hidden="true" />
              PRACTICE
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="font-lateral text-[clamp(32px,6vw,56px)] font-extrabold uppercase leading-[0.85] tracking-normal text-carbon"
            >
              What do you want
              <br />
              to practice?
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-lg font-aeonik text-[15px] font-medium leading-relaxed text-carbon/80"
            >
              Pick one of your saved jobs and I&apos;ll break down what it actually asks for. Don&apos;t
              have one saved? Paste any job description below instead.
            </motion.p>
          </div>

          {savedJobs === null && !jobsError && (
            <div className="flex items-center gap-2 py-4 font-aeonik text-sm font-medium text-carbon/60">
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Loading your saved jobs...
            </div>
          )}

          {jobsError && (
            <p className="rounded-[16px] border border-carbon bg-sunburst px-3.5 py-2.5 font-aeonik text-xs font-bold text-carbon">
              {jobsError}
            </p>
          )}

          {savedJobs && savedJobs.length > 0 && (
            <div className="flex flex-col gap-2">
              {savedJobs.map((job) => {
                const isAnalyzingThis = analyzing && selectedJob?.id === job.id;
                return (
                  <button
                    key={job.id}
                    type="button"
                    onClick={() => handlePickJob(job)}
                    disabled={analyzing}
                    className={cn(
                      "flex items-center gap-3 rounded-[20px] border border-carbon bg-paper-white p-3.5 text-left transition-colors",
                      "hover:bg-sky-wash/40 focus-visible:ring-3 focus-visible:ring-carbon/30 focus-visible:outline-none",
                      "disabled:opacity-60"
                    )}
                  >
                    <Heart className="size-5 shrink-0 fill-current text-ember" aria-hidden="true" />
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate font-aeonik text-sm font-extrabold text-carbon">
                          {job.title}
                        </span>
                        <span
                          className={cn(
                            "shrink-0 rounded-full border border-carbon px-2.5 py-0.5 font-aeonik text-[10px] font-bold text-carbon",
                            job.skills ? "bg-mint-pop" : "bg-soft-mist"
                          )}
                        >
                          {job.skills ? "Analyzed" : "Not analyzed yet"}
                        </span>
                      </div>
                      <span className="flex items-center gap-1.5 font-aeonik text-xs font-medium text-carbon/70">
                        <Building2 className="size-3.5" aria-hidden="true" />
                        {job.company}
                      </span>
                    </div>
                    {isAnalyzingThis ? (
                      <Loader2 className="size-5 shrink-0 animate-spin text-carbon" aria-hidden="true" />
                    ) : (
                      <ArrowRight className="size-5 shrink-0 text-carbon/50" aria-hidden="true" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {savedJobs && savedJobs.length === 0 && !jobsError && (
            <p className="rounded-[20px] border border-dashed border-carbon/40 bg-paper-white p-4 text-center font-aeonik text-sm font-medium text-carbon/70">
              You haven&apos;t saved any jobs yet.{" "}
              <button
                type="button"
                onClick={() => router.push("/job")}
                className="font-bold text-carbon underline underline-offset-2"
              >
                Find one
              </button>{" "}
              or paste a job description below.
            </p>
          )}

          <div
            className={cn(
              "flex flex-col gap-4 rounded-[30px] border border-carbon bg-paper-white p-6 sm:p-7",
              showPasteBox && "bg-lavender/25"
            )}
          >
            <button
              type="button"
              onClick={() => setShowPasteBox((v) => !v)}
              className="flex w-full cursor-pointer items-center gap-2 text-left"
            >
              <ClipboardPaste className="size-4 text-carbon" aria-hidden="true" />
              <span className="font-aeonik text-base font-extrabold text-carbon">
                Or paste a job description
              </span>
            </button>
            <AnimatePresence initial={false}>
              {showPasteBox && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col gap-3 overflow-hidden"
                >
                  <p className="font-aeonik text-xs leading-relaxed text-carbon/70">
                    Got a JD you like the look of but don&apos;t want to save? Drop it here — I&apos;ll
                    analyze it right away, no need to add it to your saved jobs first.
                  </p>
                  <Textarea
                    value={pastedJd}
                    onChange={(e) => setPastedJd(e.target.value)}
                    placeholder="Paste the full job description here..."
                    maxLength={8000}
                    className="min-h-40 rounded-[20px] border-carbon font-aeonik"
                    disabled={analyzing}
                  />
                  {analyzeError && !selectedJob && (
                    <p className="rounded-[16px] border border-carbon bg-ember px-3.5 py-2.5 font-aeonik text-xs font-bold text-paper-white">
                      {analyzeError}
                    </p>
                  )}
                  <Button
                    size="lg"
                    className="h-11 rounded-full border border-carbon bg-carbon font-aeonik font-bold text-paper-white hover:bg-carbon/85"
                    onClick={handleAnalyzePasted}
                    disabled={analyzing || pastedJd.trim().length < MIN_JD_LENGTH}
                  >
                    {analyzing && !selectedJob ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Sparkles className="size-4" aria-hidden="true" />
                    )}
                    Analyze this job
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {analyzing && selectedJob && (
            <p
              className="flex items-center gap-2 font-aeonik text-sm font-medium text-carbon/70"
              aria-live="polite"
            >
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Reading the job description for {selectedJob.title}...
            </p>
          )}
          {analyzeError && selectedJob && (
            <p className="rounded-[16px] border border-carbon bg-ember px-3.5 py-2.5 font-aeonik text-sm font-bold text-paper-white">
              {analyzeError}
            </p>
          )}
        </main>
      </div>
    );
  }

  // --- Screen 2: rate confidence on every skill ---
  if (screen === "rate") {
    return (
      <div className="flex min-h-screen flex-col bg-sky-wash">
        <LandingNavbar userEmail={userEmail} />

        <main className="mx-auto flex w-full max-w-[860px] flex-1 flex-col gap-8 px-5 py-12 sm:px-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <h1 className="font-lateral text-[clamp(28px,5vw,44px)] font-extrabold uppercase leading-[0.85] tracking-normal text-carbon">
                How confident
                <br />
                are you?
              </h1>
              <button
                type="button"
                onClick={handleChangeJob}
                className="min-h-11 shrink-0 cursor-pointer font-aeonik text-xs font-bold text-carbon/60 underline underline-offset-2 hover:text-carbon"
              >
                Change job
              </button>
            </div>
            <p className="max-w-lg font-aeonik text-[15px] font-medium leading-relaxed text-carbon/80">
              Rate each skill this job asks for — honestly, not how you wish you felt. I&apos;ll use
              this to flag the one costing you the most.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {session.skills.map((skill, i) => {
              const rating = ratings[skill.name] ?? DEFAULT_RATING;
              return (
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.3), ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col gap-3 rounded-[20px] border border-carbon bg-paper-white p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-aeonik text-[15px] font-extrabold text-carbon">{skill.name}</span>
                    <div className="flex gap-1.5">
                      <span className="rounded-full border border-carbon bg-soft-mist px-2.5 py-0.5 font-aeonik text-[10px] font-bold text-carbon">
                        {skill.type}
                      </span>
                      <span
                        className={cn(
                          "rounded-full border border-carbon px-2.5 py-0.5 font-aeonik text-[10px] font-bold text-carbon",
                          IMPORTANCE_STICKER[skill.importance]
                        )}
                      >
                        {skill.importance}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div
                      role="radiogroup"
                      aria-label={`Confidence in ${skill.name}`}
                      className="flex gap-1.5"
                    >
                      {[1, 2, 3, 4, 5].map((value) => {
                        const isSelected = rating === value;
                        return (
                          <button
                            key={value}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            aria-label={`${value} out of 5 — ${RATING_LABELS[value - 1]}`}
                            onClick={() => handleRate(skill.name, value)}
                            className={cn(
                              "min-h-11 flex-1 cursor-pointer rounded-full border border-carbon font-aeonik text-sm font-extrabold tabular-nums transition-all",
                              "focus-visible:ring-3 focus-visible:ring-carbon/30 focus-visible:outline-none",
                              isSelected
                                ? "bg-carbon text-paper-white"
                                : "bg-paper-white text-carbon hover:bg-soft-mist"
                            )}
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>
                    <span className="font-aeonik text-xs font-bold text-carbon/60">
                      {RATING_LABELS[rating - 1]}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <Button
            size="lg"
            className="h-12 rounded-full border border-carbon bg-carbon font-aeonik text-base font-extrabold text-paper-white hover:bg-carbon/85"
            onClick={() => setScreen("overview")}
          >
            See my skill breakdown
            <ArrowRight className="size-5" aria-hidden="true" />
          </Button>
        </main>
      </div>
    );
  }

  // --- Screen 3: overview — every skill's rating + % complete, door into its Practice Room ---
  const allSkillNames = session.skills.map((s) => s.name);
  const fullyPracticedCount = allSkillNames.filter(
    (n) => (cardProgress[n]?.completedCards.length ?? 0) >= GRADEABLE_CARD_KINDS.length
  ).length;
  const allPracticed = fullyPracticedCount === allSkillNames.length;

  return (
    <div className="flex min-h-screen flex-col bg-sky-wash">
      <LandingNavbar userEmail={userEmail} />

      <main className="mx-auto flex w-full max-w-[860px] flex-1 flex-col gap-8 px-5 py-12 sm:px-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-lateral text-[clamp(28px,5vw,44px)] font-extrabold uppercase leading-[0.85] tracking-normal text-carbon">
              Your skill
              <br />
              breakdown
            </h1>
            <button
              type="button"
              onClick={() => setScreen("rate")}
              className="min-h-11 shrink-0 cursor-pointer font-aeonik text-xs font-bold text-carbon/60 underline underline-offset-2 hover:text-carbon"
            >
              Edit ratings
            </button>
          </div>
          <p className="max-w-lg font-aeonik text-[15px] font-medium leading-relaxed text-carbon/80">
            {biggestGapSkill
              ? `"${biggestGapSkill.name}" looks like your biggest gap — high importance, lower confidence. Start there, or pick any skill below.`
              : "Pick any skill below to open its practice room."}
          </p>
        </div>

        <div className="flex flex-col gap-1.5 rounded-[20px] border border-carbon bg-paper-white p-4">
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-aeonik text-sm font-bold text-carbon">Skills fully practiced</span>
            <span className="font-aeonik text-xs font-extrabold tabular-nums text-carbon/60">
              {fullyPracticedCount} of {allSkillNames.length}
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full border border-carbon bg-soft-mist">
            <div
              className="h-full rounded-full bg-mint-pop transition-[width] duration-500 ease-out"
              style={{
                width: `${allSkillNames.length > 0 ? (fullyPracticedCount / allSkillNames.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {session.skills.map((skill, i) => {
            const isBiggestGap = skill.name === biggestGapSkill?.name;
            const rating = ratings[skill.name] ?? DEFAULT_RATING;
            const progress = cardProgress[skill.name];
            const percent = percentComplete(progress);
            const isFullyPracticed = percent >= 100;

            return (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.3), ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  "flex flex-col gap-3 rounded-[20px] border border-carbon p-4 transition-colors",
                  isBiggestGap ? "bg-sky-wash" : "bg-paper-white"
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-aeonik text-[15px] font-extrabold text-carbon">{skill.name}</span>
                    {isBiggestGap && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-carbon bg-ember px-2.5 py-0.5 font-aeonik text-[10px] font-bold text-paper-white">
                        <Target className="size-3" aria-hidden="true" />
                        Biggest gap
                      </span>
                    )}
                    {isFullyPracticed && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-carbon bg-mint-pop px-2.5 py-0.5 font-aeonik text-[10px] font-bold text-carbon">
                        <Trophy className="size-3" aria-hidden="true" />
                        Fully practiced
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1.5">
                    <span className="rounded-full border border-carbon bg-soft-mist px-2.5 py-0.5 font-aeonik text-[10px] font-bold text-carbon">
                      {skill.type}
                    </span>
                    <span
                      className={cn(
                        "rounded-full border border-carbon px-2.5 py-0.5 font-aeonik text-[10px] font-bold text-carbon",
                        IMPORTANCE_STICKER[skill.importance]
                      )}
                    >
                      {skill.importance}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-aeonik text-xs font-bold">
                  <span className="text-carbon/60">
                    Your rating: <span className="text-carbon">{RATING_LABELS[rating - 1]}</span>
                  </span>
                  <span className="text-carbon/60">
                    {progress?.completedCards.length ?? 0} of {GRADEABLE_CARD_KINDS.length} cards done
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-baseline justify-between">
                    <span />
                    <span className="font-aeonik text-xs font-extrabold tabular-nums text-carbon/60">
                      {percent}%
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full border border-carbon bg-soft-mist">
                    <div
                      className={cn(
                        "h-full rounded-full transition-[width] duration-500 ease-out",
                        isFullyPracticed ? "bg-mint-pop" : "bg-electric-blue"
                      )}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    size="lg"
                    className="h-11 flex-1 rounded-full border border-carbon bg-carbon font-aeonik font-extrabold text-paper-white hover:bg-carbon/85"
                    onClick={() => handleEnterRoom(skill)}
                  >
                    <Dumbbell className="size-4.5" aria-hidden="true" />
                    {percent > 0 ? "Back to practice room" : "Enter practice room"}
                    <ArrowRight className="size-4.5" aria-hidden="true" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-11 rounded-full border border-carbon bg-paper-white font-aeonik font-bold text-carbon hover:bg-soft-mist"
                    onClick={() => router.push(`/courses?skill=${encodeURIComponent(skill.name)}`)}
                  >
                    <GraduationCap className="size-4.5" aria-hidden="true" />
                    Find courses
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div
          className={cn(
            "flex flex-col gap-3 rounded-[30px] border border-carbon p-6",
            allPracticed ? "bg-mint-pop/30" : "bg-paper-white"
          )}
        >
          <div className="flex items-center gap-2">
            {allPracticed ? (
              <Trophy className="size-5 text-carbon" aria-hidden="true" />
            ) : (
              <Lock className="size-5 text-carbon/50" aria-hidden="true" />
            )}
            <span className="font-aeonik text-base font-extrabold text-carbon">
              {allPracticed ? "Full interview unlocked" : "Full interview locked"}
            </span>
          </div>

          {allPracticed ? (
            <>
              <p className="font-aeonik text-sm font-medium leading-relaxed text-carbon/80">
                You&apos;ve fully practiced every skill from this job. Ready for the real thing — one
                interview covering all of them?
              </p>
              <Button
                size="lg"
                className="h-12 rounded-full border border-carbon bg-carbon font-aeonik text-base font-extrabold text-paper-white hover:bg-carbon/85"
                onClick={() => {
                  // /interview/full reads this exact key regardless of
                  // which screen sent it here — see that page's comment.
                  sessionStorage.setItem("acsc:mockTestPracticedSkills", JSON.stringify(allSkillNames));
                  router.push("/interview/full");
                }}
              >
                <Trophy className="size-5" aria-hidden="true" />
                Take the full interview
              </Button>
            </>
          ) : (
            <p className="font-aeonik text-sm font-medium leading-relaxed text-carbon/70">
              Fully practice all {allSkillNames.length} skills (all 6 cards each) to unlock a full
              mock interview covering every one of them.
            </p>
          )}
        </div>

        {/* Bottom-of-page nudge toward Courses — same "you just did the
            thing, here's the natural next step" pattern as the saved-job
            banner on /job, just pointed at real YouTube videos instead of
            Practice itself. */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-4 rounded-[30px] border border-carbon bg-lavender p-8 text-center"
        >
          <GraduationCap className="size-8 text-carbon" aria-hidden="true" />
          <div className="flex flex-col gap-1.5">
            <h2 className="font-aeonik text-lg font-extrabold text-carbon">
              Want to go deeper on any of these?
            </h2>
            <p className="max-w-sm font-aeonik text-sm font-medium leading-relaxed text-carbon/70">
              Courses has real YouTube videos for any skill — pick one from this job, or search
              for something else entirely.
            </p>
          </div>
          <Button
            size="lg"
            className="h-12 rounded-full border border-carbon bg-carbon px-7 font-aeonik text-sm font-bold tracking-[0.02em] text-paper-white hover:bg-carbon/85"
            onClick={() => router.push("/courses")}
          >
            Browse Courses
            <ArrowRight className="size-4.5" aria-hidden="true" />
          </Button>
        </motion.div>
      </main>
    </div>
  );
}
