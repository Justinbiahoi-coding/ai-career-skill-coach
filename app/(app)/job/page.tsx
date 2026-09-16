"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Building2, ChevronDown, ExternalLink, Heart, Loader2, Search } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { JOB_SUGGESTIONS, normalizeForSearch } from "@/lib/fallback-data";
import { saveJob } from "@/lib/saved-jobs";
import { cn } from "cn";
import type { JobDescriptionResult, JobListing, JobSearchResult } from "@/lib/types";

const SOURCE_STICKER: Record<string, string> = {
  VietnamWorks: "bg-sky-wash",
  ITviec: "bg-lavender",
  CareerLink: "bg-mint-pop",
  TopDev: "bg-sunburst",
  TopCV: "bg-soft-mist",
  RemoteOK: "bg-voltage-violet text-paper-white",
};

/**
 * Find Job: search and like, nothing else. Liking a job is a plain database
 * write (saveJob), not an AI call — Practice is what analyzes a job's
 * skills, and only for the one job the user actually opens there. Someone
 * can like ten postings here without spending a single Gemini call.
 *
 * Styled to the Slush system (see DESIGN.md): carbon-outlined cards on paper
 * white, sticker-colored source badges, pill-shaped controls. No JourneyBar
 * here — Find Job, Practice and Mock Test are three independent areas now,
 * not steps 1-5 of one line, so LandingNavbar's own tab row is the only
 * top-level navigation.
 */
export default function FindJobPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null | undefined>(undefined);

  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [jobs, setJobs] = useState<JobListing[] | null>(null);
  const [searchNotice, setSearchNotice] = useState<string | null>(null);

  // Per-job UI state, keyed by job.id — several jobs can be mid-save or
  // already-saved at once, so this can't be a single shared value.
  const [savingJobId, setSavingJobId] = useState<string | null>(null);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [saveError, setSaveError] = useState<string | null>(null);

  // Preview accordion: tapping a card expands a JD preview inline, separate
  // from saving. Looking at a job shouldn't cost anything or imply a
  // decision — only the heart button does that. At most one open at a time
  // keeps the list from growing unboundedly long.
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [previewText, setPreviewText] = useState<Record<string, string>>({});
  const [previewLoadingId, setPreviewLoadingId] = useState<string | null>(null);
  const [previewErrorId, setPreviewErrorId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null));
  }, []);

  const suggestions = useMemo(() => {
    const typed = normalizeForSearch(query);
    if (!typed) return JOB_SUGGESTIONS.slice(0, 8);
    return JOB_SUGGESTIONS.filter((s) => normalizeForSearch(s).includes(typed)).slice(0, 8);
  }, [query]);

  async function handleSearch(term: string = query) {
    const q = term.trim();
    if (!q || searching) return;
    setQuery(term);
    setSearching(true);
    setSearchNotice(null);
    setJobs(null);

    try {
      const res = await fetch(`/api/jobs/search?q=${encodeURIComponent(q)}`);
      const data: JobSearchResult = await res.json();
      setJobs(data.jobs);
      if (data.usedFallback) {
        setSearchNotice("Live job sources didn't respond, showing saved real listings instead.");
      }
    } catch {
      setSearchNotice("Couldn't reach the job sources. Try again in a moment.");
    } finally {
      setSearching(false);
    }
  }

  async function handleSave(job: JobListing) {
    if (savingJobId || savedJobIds.has(job.id)) return;
    setSavingJobId(job.id);
    setSaveError(null);

    try {
      // ITviec doesn't return the JD text in search results — has to be
      // fetched from the detail page before there's anything to save.
      let jdText = job.jdText;
      if (!jdText) {
        const res = await fetch(`/api/jobs/jd?url=${encodeURIComponent(job.url)}`);
        const data: JobDescriptionResult = await res.json();
        jdText = data.jdText;
      }

      if (!jdText) {
        setSaveError("Couldn't read that job's description. Try a different listing.");
        return;
      }

      await saveJob({ title: job.title, company: job.company, source: job.source, url: job.url, jdText });
      setSavedJobIds((prev) => new Set(prev).add(job.id));
    } catch {
      setSaveError("Couldn't save that job — check your connection and try again.");
    } finally {
      setSavingJobId(null);
    }
  }

  async function handleTogglePreview(job: JobListing) {
    // Collapsing never needs a fetch — only opening does.
    if (expandedJobId === job.id) {
      setExpandedJobId(null);
      return;
    }
    setExpandedJobId(job.id);
    setPreviewErrorId(null);

    // Already have the text (VietnamWorks/RemoteOK return it inline, or it
    // was already fetched once this session) — nothing to load.
    if (job.jdText || previewText[job.id]) return;

    setPreviewLoadingId(job.id);
    try {
      const res = await fetch(`/api/jobs/jd?url=${encodeURIComponent(job.url)}`);
      const data: JobDescriptionResult = await res.json();
      if (!data.jdText) throw new Error("empty");
      setPreviewText((prev) => ({ ...prev, [job.id]: data.jdText }));
    } catch {
      setPreviewErrorId(job.id);
    } finally {
      setPreviewLoadingId(null);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-sky-wash">
      <LandingNavbar userEmail={userEmail} />

      <main className="mx-auto flex w-full max-w-[860px] flex-1 flex-col gap-8 px-5 py-12 sm:px-8">
        {/* Header block */}
        <div className="flex flex-col gap-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex w-fit items-center gap-2 rounded-full border border-carbon bg-paper-white px-4 py-1.5 text-xs font-bold tracking-[0.032em] text-carbon"
          >
            <Search className="size-3.5" aria-hidden="true" />
            FIND JOB
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="font-lateral text-[clamp(36px,7vw,64px)] font-extrabold uppercase leading-[0.85] tracking-normal text-carbon"
          >
            Find a job you&apos;d
            <br />
            actually apply for
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-lg font-aeonik text-[15px] font-medium leading-relaxed text-carbon/80"
          >
            Search real postings and tap the heart on any you like. Save a few — you&apos;ll pick
            one to practice next, and another when you&apos;re ready for a mock interview.
          </motion.p>
        </div>

        {/* Search card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-4 rounded-[30px] border border-carbon bg-paper-white p-6 sm:p-7"
        >
          <div className="flex gap-2">
            <Input
              placeholder="e.g. data analyst, frontend developer, marketing"
              value={query}
              maxLength={100}
              aria-label="Job title to search for"
              className="h-12 rounded-full border-carbon px-5 font-aeonik text-[15px]"
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
            />
            <Button
              size="lg"
              className="h-12 shrink-0 rounded-full border border-carbon bg-carbon px-6 font-aeonik text-sm font-bold tracking-[0.02em] text-paper-white hover:bg-carbon/85"
              onClick={() => handleSearch()}
              disabled={searching || !query.trim()}
            >
              {searching ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Search className="size-4" aria-hidden="true" />
              )}
              {searching ? "Searching" : "Search"}
            </Button>
          </div>

          {suggestions.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-aeonik text-xs font-bold tracking-[0.02em] text-carbon/60">
                {query.trim() ? "Suggestions:" : "Try:"}
              </span>
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSearch(s)}
                  disabled={searching}
                  className="min-h-9 cursor-pointer rounded-full border border-carbon bg-soft-mist px-3.5 py-1.5 font-aeonik text-xs font-bold text-carbon transition-colors hover:bg-sky-wash focus-visible:ring-3 focus-visible:ring-carbon/30 focus-visible:outline-none disabled:opacity-60"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {searchNotice && (
            <p className="rounded-[16px] border border-carbon bg-sunburst px-3.5 py-2.5 font-aeonik text-xs font-bold text-carbon">
              {searchNotice}
            </p>
          )}
          {saveError && (
            <p className="rounded-[16px] border border-carbon bg-ember px-3.5 py-2.5 font-aeonik text-xs font-bold text-paper-white">
              {saveError}
            </p>
          )}

          {jobs && jobs.length === 0 && (
            <p className="font-aeonik text-sm font-medium text-carbon/70">
              No jobs matched that search. Try a broader keyword.
            </p>
          )}
        </motion.div>

        {/* Results list */}
        <AnimatePresence mode="popLayout">
          {jobs && jobs.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-3"
            >
              {jobs.map((job, i) => {
                const isSaved = savedJobIds.has(job.id);
                const isSaving = savingJobId === job.id;
                const stickerClass = SOURCE_STICKER[job.source] ?? "bg-soft-mist";
                const isExpanded = expandedJobId === job.id;
                const isPreviewLoading = previewLoadingId === job.id;
                const previewFailed = previewErrorId === job.id;
                const jdPreview = job.jdText ?? previewText[job.id];

                return (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.3), ease: [0.16, 1, 0.3, 1] }}
                    className={cn(
                      "overflow-hidden rounded-[20px] border border-carbon transition-colors",
                      isSaved ? "bg-mint-pop/25" : "bg-paper-white"
                    )}
                  >
                    <div className="flex items-start gap-4 p-4">
                      <div className="flex min-w-0 flex-1 flex-col gap-2">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-aeonik text-[15px] font-extrabold text-carbon">
                            {job.title}
                          </span>
                          <span
                            className={cn(
                              "shrink-0 rounded-full border border-carbon px-2.5 py-0.5 font-aeonik text-[10px] font-bold tracking-[0.02em] text-carbon",
                              stickerClass
                            )}
                          >
                            {job.source}
                          </span>
                        </div>
                        <span className="flex items-center gap-1.5 font-aeonik text-xs font-medium text-carbon/70">
                          <Building2 className="size-3.5" aria-hidden="true" />
                          {job.company}
                        </span>

                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleTogglePreview(job)}
                            aria-expanded={isExpanded}
                            className="inline-flex w-fit items-center gap-1 font-aeonik text-xs font-bold text-carbon/70 underline underline-offset-2 hover:text-carbon"
                          >
                            {isExpanded ? "Hide job description" : "View job description"}
                            {isPreviewLoading ? (
                              <Loader2 className="size-3 animate-spin" aria-hidden="true" />
                            ) : (
                              <motion.span
                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                className="inline-flex"
                              >
                                <ChevronDown className="size-3.5" aria-hidden="true" />
                              </motion.span>
                            )}
                          </button>

                          <a
                            href={job.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex w-fit items-center gap-1 font-aeonik text-xs font-bold text-carbon/70 underline underline-offset-2 hover:text-carbon"
                          >
                            View original posting
                            <ExternalLink className="size-3" aria-hidden="true" />
                          </a>
                        </div>
                      </div>

                      <motion.button
                        type="button"
                        onClick={() => handleSave(job)}
                        disabled={isSaving || isSaved}
                        whileHover={!isSaved ? { scale: 1.08 } : undefined}
                        whileTap={!isSaved ? { scale: 0.92 } : undefined}
                        aria-label={isSaved ? `${job.title} saved` : `Save ${job.title}`}
                        aria-pressed={isSaved}
                        className={cn(
                          "flex size-11 shrink-0 items-center justify-center rounded-full border border-carbon transition-colors",
                          "focus-visible:ring-3 focus-visible:ring-carbon/30 focus-visible:outline-none",
                          isSaved ? "bg-ember text-paper-white" : "bg-paper-white text-carbon hover:bg-soft-mist"
                        )}
                      >
                        {isSaving ? (
                          <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                        ) : (
                          <Heart className={cn("size-5", isSaved && "fill-current")} aria-hidden="true" />
                        )}
                      </motion.button>
                    </div>

                    {/* JD preview: collapsed by default, only fetched/shown on request.
                        Purely informational — it never selects the job for Practice, that's
                        still only the heart button. */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          key="preview"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                          className="border-t border-carbon"
                        >
                          <div className="max-h-72 overflow-y-auto bg-soft-mist/60 p-4">
                            {previewFailed && (
                              <p className="font-aeonik text-xs font-bold text-carbon/70">
                                Couldn&apos;t load the full description.{" "}
                                <a
                                  href={job.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="underline underline-offset-2"
                                >
                                  View the original posting instead.
                                </a>
                              </p>
                            )}
                            {!previewFailed && jdPreview && (
                              <p className="font-aeonik text-xs leading-relaxed whitespace-pre-line text-carbon/80">
                                {jdPreview}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}

              <p className="mt-1 font-aeonik text-[11px] leading-relaxed text-carbon/50">
                Job listings are borrowed from public postings on VietnamWorks, ITviec, CareerLink,
                TopDev and RemoteOK for this demo. All rights belong to the original sites and
                employers.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom-of-page nudge toward Practice — appears once at least one job
            is saved, but is never sticky or interrupting: someone can keep
            liking more jobs and only reach this by scrolling down to it. */}
        {savedJobIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 flex flex-col items-center gap-4 rounded-[30px] border border-carbon bg-lavender p-8 text-center"
          >
            <Heart className="size-8 fill-current text-carbon" aria-hidden="true" />
            <div className="flex flex-col gap-1.5">
              <h2 className="font-aeonik text-lg font-extrabold text-carbon">
                {savedJobIds.size === 1 ? "Nice, you saved a job" : `Nice, you saved ${savedJobIds.size} jobs`}
              </h2>
              <p className="max-w-sm font-aeonik text-sm font-medium leading-relaxed text-carbon/70">
                Whenever you&apos;re ready, head to Practice and pick one to break down and start
                learning. No rush — keep liking jobs if you&apos;re still deciding.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                size="lg"
                className="h-12 rounded-full border border-carbon bg-carbon px-7 font-aeonik text-sm font-bold tracking-[0.02em] text-paper-white hover:bg-carbon/85"
                onClick={() => router.push("/gap")}
              >
                Go to Practice
                <ArrowRight className="size-4.5" aria-hidden="true" />
              </Button>
              <span className="font-aeonik text-xs font-bold tracking-[0.02em] text-carbon/60">
                or keep browsing above
              </span>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
