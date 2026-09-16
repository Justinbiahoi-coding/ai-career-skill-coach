"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowRight, Building2, Loader2, Trophy } from "lucide-react";
import { motion } from "motion/react";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { cn } from "cn";
import { getJobProgress, listPracticedSkillsForJob, listSavedJobs } from "@/lib/saved-jobs";
import { saveExtractedSkills } from "@/lib/session-store";
import type { JobProgress, SavedJob } from "@/lib/types";

/**
 * Mock Test: pick a saved, analyzed job, see how much of it has actually
 * been practiced, and start a full interview on it — with the warning being
 * exactly that (a warning, not a gate). "Have I practiced enough" is a real
 * DB read (listPracticedSkillsForJob), not sessionStorage, so this works
 * even for a job practiced yesterday in a different tab.
 *
 * Styled to the Slush system, matching /job, /gap and /learn.
 */
export default function MockTestPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null | undefined>(undefined);
  const [jobs, setJobs] = useState<SavedJob[] | null>(null);
  const [jobsError, setJobsError] = useState<string | null>(null);

  const [selectedJob, setSelectedJob] = useState<SavedJob | null>(null);
  const [progress, setProgress] = useState<JobProgress | null>(null);
  const [practicedNames, setPracticedNames] = useState<string[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [progressError, setProgressError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null));

    listSavedJobs()
      .then(setJobs)
      .catch(() => setJobsError("Couldn't load your saved jobs."));
  }, []);

  // Only jobs Practice has actually analyzed can be interviewed on — an
  // unanalyzed job has no skills list, so there's nothing to be asked about.
  const analyzedJobs = useMemo(() => (jobs ?? []).filter((j) => j.skills && j.skills.length > 0), [jobs]);

  async function handlePickJob(job: SavedJob) {
    setSelectedJob(job);
    setProgress(null);
    setProgressError(null);
    setLoadingProgress(true);
    try {
      const totalSkills = job.skills?.length ?? 0;
      const [jobProgress, practiced] = await Promise.all([
        getJobProgress(job.id, totalSkills),
        listPracticedSkillsForJob(job.id),
      ]);
      setProgress(jobProgress);
      setPracticedNames(practiced);
    } catch {
      setProgressError("Couldn't check your practice history for this job — you can still start anyway.");
    } finally {
      setLoadingProgress(false);
    }
  }

  function handleStartInterview() {
    if (!selectedJob || !selectedJob.skills) return;
    // interview/full reads its context from sessionStorage (jdText + skills +
    // which of those skills to ask about), the same shape Practice writes —
    // Mock Test writes it too so the two entry points converge on one page.
    //
    // Always send every one of the job's skills, not just practicedNames:
    // a full interview should cover the whole job regardless of how much
    // practice happened first. "Start anyway" with zero practiced skills
    // still needs *something* to ask about — an empty list would leave the
    // interviewer with nothing, and the API rejects an empty skill list
    // outright. Practicing first doesn't narrow the interview's scope; it
    // only changes how prepared the candidate is walking in.
    const allSkillNames = selectedJob.skills.map((s) => s.name);
    saveExtractedSkills({ jdText: selectedJob.jdText, skills: selectedJob.skills }, selectedJob.id);
    sessionStorage.setItem("acsc:mockTestPracticedSkills", JSON.stringify(allSkillNames));
    router.push("/interview/full");
  }

  function handleChangeJob() {
    setSelectedJob(null);
    setProgress(null);
    setProgressError(null);
  }

  // --- Step 1: pick an analyzed job ---
  if (!selectedJob) {
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
              <Trophy className="size-3.5" aria-hidden="true" />
              MOCK TEST
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="font-lateral text-[clamp(30px,6vw,52px)] font-extrabold uppercase leading-[0.85] tracking-normal text-carbon"
            >
              Ready for a mock
              <br />
              interview?
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-lg font-aeonik text-[15px] font-medium leading-relaxed text-carbon/80"
            >
              Pick one of your analyzed jobs. I&apos;ll check how much you&apos;ve practiced first —
              but it&apos;s your call whether to jump in anyway.
            </motion.p>
          </div>

          {jobs === null && !jobsError && (
            <div className="flex items-center gap-2 py-4 font-aeonik text-sm font-medium text-carbon/60">
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Loading your saved jobs...
            </div>
          )}

          {jobsError && (
            <p className="rounded-[16px] border border-carbon bg-ember px-3.5 py-2.5 font-aeonik text-sm font-bold text-paper-white">
              {jobsError}
            </p>
          )}

          {jobs && analyzedJobs.length === 0 && !jobsError && (
            <p className="rounded-[20px] border border-dashed border-carbon/40 bg-paper-white p-4 text-center font-aeonik text-sm font-medium text-carbon/70">
              No analyzed jobs yet.{" "}
              <button
                type="button"
                onClick={() => router.push("/gap")}
                className="font-bold text-carbon underline underline-offset-2"
              >
                Head to Practice
              </button>{" "}
              to pick a saved job and break down its skills first.
            </p>
          )}

          {analyzedJobs.length > 0 && (
            <div className="flex flex-col gap-2">
              {analyzedJobs.map((job, i) => (
                <motion.button
                  key={job.id}
                  type="button"
                  onClick={() => handlePickJob(job)}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: Math.min(i * 0.05, 0.3), ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-center gap-3 rounded-[20px] border border-carbon bg-paper-white p-3.5 text-left transition-colors hover:bg-sky-wash/40 focus-visible:ring-3 focus-visible:ring-carbon/30 focus-visible:outline-none"
                >
                  <Trophy className="size-5 shrink-0 text-carbon" aria-hidden="true" />
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="truncate font-aeonik text-sm font-extrabold text-carbon">
                      {job.title}
                    </span>
                    <span className="flex items-center gap-1.5 font-aeonik text-xs font-medium text-carbon/70">
                      <Building2 className="size-3.5" aria-hidden="true" />
                      {job.company}
                    </span>
                  </div>
                  <span className="shrink-0 rounded-full border border-carbon bg-soft-mist px-2.5 py-0.5 font-aeonik text-[10px] font-bold text-carbon">
                    {job.skills?.length ?? 0} skills
                  </span>
                  <ArrowRight className="size-5 shrink-0 text-carbon/50" aria-hidden="true" />
                </motion.button>
              ))}
            </div>
          )}
        </main>
      </div>
    );
  }

  // --- Step 2: show progress for the chosen job, warn if under-practiced ---
  const totalSkills = selectedJob.skills?.length ?? 0;
  const practicedCount = progress?.practicedSkills ?? 0;
  const readyEnough = totalSkills > 0 && practicedCount >= totalSkills;
  const unpracticed = (selectedJob.skills ?? []).filter((s) => !practicedNames.includes(s.name));

  return (
    <div className="flex min-h-screen flex-col bg-sky-wash">
      <LandingNavbar userEmail={userEmail} />

      <main className="mx-auto flex w-full max-w-[860px] flex-1 flex-col gap-8 px-5 py-12 sm:px-8">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h1 className="font-lateral text-[clamp(26px,5vw,40px)] font-extrabold uppercase leading-[0.9] text-carbon">
              {selectedJob.title}
            </h1>
            <span className="flex items-center gap-1.5 font-aeonik text-sm font-medium text-carbon/70">
              <Building2 className="size-4" aria-hidden="true" />
              {selectedJob.company}
            </span>
          </div>
          <button
            type="button"
            onClick={handleChangeJob}
            className="min-h-11 shrink-0 cursor-pointer font-aeonik text-xs font-bold text-carbon/60 underline underline-offset-2 hover:text-carbon"
          >
            Change job
          </button>
        </div>

        {loadingProgress && (
          <div className="flex items-center gap-2 py-8 font-aeonik text-sm font-medium text-carbon/60">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Checking your practice history...
          </div>
        )}

        {progressError && (
          <p className="rounded-[16px] border border-carbon bg-sunburst px-3.5 py-2.5 font-aeonik text-xs font-bold text-carbon">
            {progressError}
          </p>
        )}

        {!loadingProgress && (
          <>
            <div className="flex flex-col gap-1.5 rounded-[20px] border border-carbon bg-paper-white p-4">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-aeonik text-sm font-bold text-carbon">
                  Skills practiced for this job
                </span>
                <span className="font-aeonik text-xs font-extrabold tabular-nums text-carbon/60">
                  {practicedCount} of {totalSkills}
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full border border-carbon bg-soft-mist">
                <div
                  className={cn(
                    "h-full rounded-full transition-[width] duration-500 ease-out",
                    readyEnough ? "bg-mint-pop" : "bg-electric-blue"
                  )}
                  style={{ width: `${totalSkills > 0 ? (practicedCount / totalSkills) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div
              className={cn(
                "flex flex-col gap-3 rounded-[30px] border border-carbon p-6",
                readyEnough ? "bg-mint-pop/30" : "bg-sunburst/30"
              )}
            >
              <div className="flex items-center gap-2">
                {readyEnough ? (
                  <Trophy className="size-5 text-carbon" aria-hidden="true" />
                ) : (
                  <AlertTriangle className="size-5 text-carbon" aria-hidden="true" />
                )}
                <span className="font-aeonik text-base font-extrabold text-carbon">
                  {readyEnough ? "You've practiced every skill" : "Some skills aren't practiced yet"}
                </span>
              </div>

              {!readyEnough && unpracticed.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {unpracticed.map((s) => (
                    <span
                      key={s.name}
                      className="rounded-full border border-carbon bg-paper-white px-2.5 py-0.5 font-aeonik text-[10px] font-bold text-carbon"
                    >
                      {s.name}
                    </span>
                  ))}
                </div>
              )}

              <p className="font-aeonik text-sm font-medium leading-relaxed text-carbon/80">
                {readyEnough
                  ? "You're covered on everything this job asks for. Let's see how it goes for real."
                  : "You can still start the interview now — it just means you'll be asked about skills you haven't drilled yet. Practicing them first usually means better answers."}
              </p>

              <div className="flex flex-col gap-2 sm:flex-row">
                {!readyEnough && (
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 flex-1 rounded-full border border-carbon bg-paper-white font-aeonik font-bold text-carbon hover:bg-soft-mist"
                    onClick={() => router.push("/gap")}
                  >
                    Practice more first
                  </Button>
                )}
                <Button
                  size="lg"
                  className={cn(
                    "h-12 flex-1 rounded-full border border-carbon font-aeonik text-base font-extrabold",
                    readyEnough
                      ? "bg-mint-pop text-carbon hover:bg-mint-pop/85"
                      : "bg-carbon text-paper-white hover:bg-carbon/85"
                  )}
                  onClick={handleStartInterview}
                >
                  <Trophy className="size-5" aria-hidden="true" />
                  {readyEnough ? "Take the full interview" : "Start anyway"}
                </Button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
