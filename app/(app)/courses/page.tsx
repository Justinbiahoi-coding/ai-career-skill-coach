"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  GraduationCap,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { motion } from "motion/react";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { listUserSkills } from "@/lib/course-recommendations";
import { cn } from "cn";
import type { CourseSearchResult, CourseVideo } from "@/lib/types";

const SKILL_STICKER = ["bg-sky-wash", "bg-lavender", "bg-mint-pop", "bg-sunburst", "bg-voltage-violet text-paper-white"];

function formatPublishedDate(iso: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

/**
 * Courses: pick a skill from your analyzed saved jobs, see real YouTube
 * search results for it. No AI here — the search query is just
 * "${skill} tutorial" sent straight to the YouTube Data API, and every
 * video shown is a real, verifiable result the student clicks through to
 * watch on YouTube itself (the "Human Review" step — nobody here is asked
 * to trust an AI's judgment of quality).
 */
function CoursesPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userEmail, setUserEmail] = useState<string | null | undefined>(undefined);

  const [skills, setSkills] = useState<string[] | null>(null);
  const [skillsError, setSkillsError] = useState<string | null>(null);

  const [selectedSkill, setSelectedSkill] = useState<string | null>(searchParams.get("skill"));
  const [result, setResult] = useState<CourseSearchResult | null>(null);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [videosError, setVideosError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null));

    listUserSkills()
      .then(setSkills)
      .catch(() => setSkillsError("Couldn't load your skills. Try refreshing the page."));
  }, []);

  function loadVideos(skill: string) {
    setLoadingVideos(true);
    setVideosError(null);
    setResult(null);

    fetch(`/api/courses/search?skill=${encodeURIComponent(skill)}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? "Request failed");
        }
        return res.json();
      })
      .then((data: CourseSearchResult) => setResult(data))
      .catch(() => setVideosError("Couldn't reach YouTube right now."))
      .finally(() => setLoadingVideos(false));
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (selectedSkill) loadVideos(selectedSkill);
  }, [selectedSkill]);

  function handleSelectSkill(skill: string) {
    setSelectedSkill(skill);
    router.replace(`/courses?skill=${encodeURIComponent(skill)}`);
  }

  function handleBackToSkills() {
    setSelectedSkill(null);
    setResult(null);
    setVideosError(null);
    router.replace("/courses");
  }

  // --- Screen: pick a skill ---
  if (!selectedSkill) {
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
              <GraduationCap className="size-3.5" aria-hidden="true" />
              COURSES
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="font-lateral text-[clamp(30px,6vw,52px)] font-extrabold uppercase leading-[0.92] tracking-normal text-carbon"
            >
              Pick a skill to
              <br />
              level up
            </motion.h1>

            <p className="max-w-lg font-aeonik text-[15px] font-medium leading-relaxed text-carbon/80">
              Real YouTube videos for any skill from your analyzed jobs — no AI picks these, you
              watch and judge for yourself.
            </p>
          </div>

          {skills === null && !skillsError && (
            <div className="flex items-center gap-2 py-4 font-aeonik text-sm font-medium text-carbon/60">
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Loading your skills...
            </div>
          )}

          {skillsError && (
            <p className="rounded-[16px] border border-carbon bg-ember px-3.5 py-2.5 font-aeonik text-sm font-bold text-paper-white">
              {skillsError}
            </p>
          )}

          {skills && skills.length === 0 && !skillsError && (
            <p className="rounded-[20px] border border-dashed border-carbon/40 bg-paper-white p-4 text-center font-aeonik text-sm font-medium text-carbon/70">
              You don&apos;t have any analyzed skills yet.{" "}
              <button
                type="button"
                onClick={() => router.push("/gap")}
                className="font-bold text-carbon underline underline-offset-2"
              >
                Head to Practice
              </button>{" "}
              and analyze a saved job first.
            </p>
          )}

          {skills && skills.length > 0 && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {skills.map((skill, i) => (
                <motion.button
                  key={skill}
                  type="button"
                  onClick={() => handleSelectSkill(skill)}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -2, scale: 1.01 }}
                  transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.3), ease: [0.16, 1, 0.3, 1] }}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-[20px] border border-carbon p-4 text-left",
                    SKILL_STICKER[i % SKILL_STICKER.length]
                  )}
                >
                  <span className="font-aeonik text-sm font-extrabold text-carbon">{skill}</span>
                  <ArrowRight className="size-5 shrink-0 text-carbon" aria-hidden="true" />
                </motion.button>
              ))}
            </div>
          )}
        </main>
      </div>
    );
  }

  // --- Screen: video list for the selected skill ---
  return (
    <div className="flex min-h-screen flex-col bg-sky-wash">
      <LandingNavbar userEmail={userEmail} />

      <main className="mx-auto flex w-full max-w-[860px] flex-1 flex-col gap-6 px-5 py-12 sm:px-8">
        <div className="flex items-start justify-between gap-3">
          <h1 className="font-lateral text-[clamp(26px,5vw,40px)] font-extrabold uppercase leading-[0.9] text-carbon">
            {selectedSkill}
          </h1>
          <button
            type="button"
            onClick={handleBackToSkills}
            className="flex min-h-11 shrink-0 cursor-pointer items-center gap-1.5 font-aeonik text-xs font-bold text-carbon/60 underline underline-offset-2 hover:text-carbon"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            All skills
          </button>
        </div>

        {loadingVideos && (
          <div className="flex items-center gap-2 py-8 font-aeonik text-sm font-medium text-carbon/60">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Searching YouTube...
          </div>
        )}

        {videosError && (
          <div className="flex flex-col items-start gap-3 rounded-[20px] border border-carbon bg-ember/20 p-4">
            <p className="font-aeonik text-sm font-bold text-carbon">{videosError}</p>
            <Button
              size="sm"
              className="h-10 rounded-full border border-carbon bg-carbon font-aeonik font-bold text-paper-white hover:bg-carbon/85"
              onClick={() => selectedSkill && loadVideos(selectedSkill)}
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              Try again
            </Button>
          </div>
        )}

        {result && result.usedFallback && result.videos.length === 0 && (
          <div className="flex flex-col items-start gap-3 rounded-[20px] border border-carbon bg-ember/20 p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-carbon" aria-hidden="true" />
              <p className="font-aeonik text-sm font-bold text-carbon">
                Couldn&apos;t load courses for this skill right now.
              </p>
            </div>
            <Button
              size="sm"
              className="h-10 rounded-full border border-carbon bg-carbon font-aeonik font-bold text-paper-white hover:bg-carbon/85"
              onClick={() => selectedSkill && loadVideos(selectedSkill)}
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              Try again
            </Button>
          </div>
        )}

        {result && result.usedFallback && result.videos.length > 0 && (
          <p className="rounded-[16px] border border-carbon bg-sunburst px-3.5 py-2.5 font-aeonik text-xs font-bold text-carbon">
            YouTube didn&apos;t respond just now, so these are saved results from an earlier
            search — still real videos, just possibly not the newest.
          </p>
        )}

        {result && result.videos.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {result.videos.map((video: CourseVideo, i) => (
              <motion.a
                key={video.videoId}
                href={`https://www.youtube.com/watch?v=${video.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.3), ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col gap-3 rounded-[20px] border border-carbon bg-paper-white p-4"
              >
                <div className="relative aspect-video w-full overflow-hidden rounded-[14px] border border-carbon bg-soft-mist">
                  {video.thumbnailUrl && (
                    <Image
                      src={video.thumbnailUrl}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, 400px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-aeonik text-sm font-extrabold leading-snug text-carbon">
                    {video.title}
                  </span>
                  <span className="font-aeonik text-xs font-medium text-carbon/60">
                    {video.channelTitle}
                    {video.publishedAt && ` · ${formatPublishedDate(video.publishedAt)}`}
                  </span>
                </div>
                {video.description && (
                  <p className="line-clamp-2 font-aeonik text-xs leading-relaxed text-carbon/70">
                    {video.description}
                  </p>
                )}
                <span className="mt-auto inline-flex items-center gap-1.5 font-aeonik text-xs font-bold text-carbon">
                  Watch on YouTube
                  <ExternalLink className="size-3.5" aria-hidden="true" />
                </span>
              </motion.a>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col bg-sky-wash">
          <LandingNavbar userEmail={undefined} />
          <main className="mx-auto flex w-full max-w-[860px] flex-1 items-center justify-center px-5 py-16">
            <p className="font-aeonik text-sm font-medium text-carbon/60">Loading...</p>
          </main>
        </div>
      }
    >
      <CoursesPageInner />
    </Suspense>
  );
}
