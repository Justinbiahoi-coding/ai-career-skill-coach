"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { loadExtractedSkills, loadSelectedGap } from "@/lib/session-store";
import type { KnowledgeCardResult } from "@/lib/types";

interface Context {
  skillName: string;
  jdText: string;
}

/**
 * Reading-only: never graded, never counted toward the skill's 6-card
 * completion. A student who already knows the skill can skip this entirely
 * and go straight to a drill card — matching the earlier decision that
 * reading material should never be a required gate.
 */
export default function KnowledgeCardPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null | undefined>(undefined);
  const [context, setContext] = useState<Context | null>(null);
  const [checkedStorage, setCheckedStorage] = useState(false);
  const [article, setArticle] = useState<KnowledgeCardResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null));

    const selectedGap = loadSelectedGap();
    const extracted = loadExtractedSkills();
    const nextContext =
      selectedGap && extracted ? { skillName: selectedGap.skill.name, jdText: extracted.jdText } : null;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setContext(nextContext);
    setCheckedStorage(true);
  }, []);

  useEffect(() => {
    if (!context) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);

    fetch("/api/generate-practice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skillName: context.skillName, jdText: context.jdText, mode: "knowledge" }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? "Request failed");
        }
        return res.json();
      })
      .then((data: KnowledgeCardResult) => {
        if (!cancelled) setArticle(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Something went wrong");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [context]);

  if (checkedStorage && !context) {
    return (
      <div className="flex min-h-screen flex-col bg-sky-wash">
        <LandingNavbar userEmail={userEmail} />
        <main className="mx-auto flex w-full max-w-[720px] flex-1 flex-col items-center justify-center gap-4 px-5 py-12 text-center">
          <p className="font-aeonik text-base font-medium text-carbon/80">
            No skill picked for this session yet.
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
        <main className="mx-auto flex w-full max-w-[720px] flex-1 items-center justify-center px-5 py-16">
          <p className="font-aeonik text-sm font-medium text-carbon/60">Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-sky-wash">
      <LandingNavbar userEmail={userEmail} />

      <main className="mx-auto flex w-full max-w-[720px] flex-1 flex-col gap-6 px-5 py-12 sm:px-8">
        <div className="flex flex-wrap items-center gap-2">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="font-lateral text-[clamp(26px,5vw,40px)] font-extrabold uppercase leading-[0.85] text-carbon"
          >
            Knowledge
          </motion.h1>
          <span className="rounded-full border border-carbon bg-electric-blue px-3 py-1 font-aeonik text-xs font-bold text-paper-white">
            {context.skillName}
          </span>
          <span className="rounded-full border border-carbon bg-soft-mist px-2.5 py-1 font-aeonik text-[10px] font-bold text-carbon">
            Optional — not graded
          </span>
        </div>

        <div className="flex flex-col gap-4 rounded-[30px] border border-carbon bg-paper-white p-6 sm:p-7">
          <div className="flex items-center gap-2">
            <BookOpen className="size-4 text-carbon" aria-hidden="true" />
            <span className="font-aeonik text-base font-extrabold text-carbon">Background reading</span>
          </div>

          {loading && (
            <div className="flex flex-col gap-2" aria-live="polite">
              <span className="flex items-center gap-2 font-aeonik text-sm text-carbon/60">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Writing this up...
              </span>
              <div className="flex flex-col gap-2" aria-hidden="true">
                {[100, 92, 96, 70].map((w, i) => (
                  <div
                    key={i}
                    className="h-3 animate-pulse rounded-full bg-soft-mist"
                    style={{ width: `${w}%` }}
                  />
                ))}
              </div>
            </div>
          )}
          {error && (
            <p className="rounded-[16px] border border-carbon bg-ember px-3.5 py-2.5 font-aeonik text-sm font-bold text-paper-white">
              {error}
            </p>
          )}
          {article && (
            <div className="flex flex-col gap-3">
              {article.usedFallback && (
                <p className="rounded-[16px] border border-carbon bg-sunburst px-3.5 py-2.5 font-aeonik text-xs font-bold text-carbon">
                  The AI coach didn&apos;t respond, so this is offline sample content.
                </p>
              )}
              <p className="font-aeonik text-sm leading-relaxed whitespace-pre-line text-carbon/90">
                {article.articleText}
              </p>
            </div>
          )}
        </div>

        <Button
          size="lg"
          variant="outline"
          className="h-12 rounded-full border border-carbon bg-paper-white font-aeonik font-bold text-carbon hover:bg-soft-mist"
          onClick={() => router.push("/learn")}
        >
          <ArrowLeft className="size-5" aria-hidden="true" />
          Back to Practice Room
        </Button>
      </main>
    </div>
  );
}
