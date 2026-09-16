"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Lock, Sparkles, Target, Trophy } from "lucide-react";
import { MascotSays } from "@/components/game/mascot-says";
import { PageShell } from "@/components/game/page-shell";
import { XpBar } from "@/components/game/xp-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "cn";
import {
  loadExtractedSkills,
  loadPracticedSkills,
  loadXp,
  saveSelectedGap,
  type ExtractedSkillsSession,
} from "@/lib/session-store";
import type { Skill, SkillImportance } from "@/lib/types";

const IMPORTANCE_WEIGHT: Record<SkillImportance, number> = { high: 3, medium: 2, low: 1 };
const DEFAULT_RATING = 3;

// Gap score: quan trọng cao + tự tin thấp -> điểm cao -> ưu tiên luyện trước.
function gapScore(skill: Skill, rating: number): number {
  return IMPORTANCE_WEIGHT[skill.importance] * (6 - rating);
}

const RATING_LABELS = ["No idea", "Shaky", "Okay", "Solid", "Strong"] as const;

export default function GapPage() {
  const router = useRouter();
  const [session, setSession] = useState<ExtractedSkillsSession | null>(null);
  const [checkedStorage, setCheckedStorage] = useState(false);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [overrideSkill, setOverrideSkill] = useState<string | null>(null);
  const [practicedSkills, setPracticedSkills] = useState<string[]>([]);
  const [xp, setXp] = useState(0);

  useEffect(() => {
    // sessionStorage chỉ đọc được ở client; SSR không có window, nên phải
    // đọc trong effect thay vì lúc render để tránh hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSession(loadExtractedSkills());
    setPracticedSkills(loadPracticedSkills());
    setXp(loadXp());
    setCheckedStorage(true);
  }, []);

  const recommendedSkill = useMemo(() => {
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

  const priorityName = overrideSkill ?? recommendedSkill?.name ?? null;
  const prioritySkill = session?.skills.find((s) => s.name === priorityName) ?? null;

  function handleRate(skillName: string, rating: number) {
    setRatings((prev) => ({ ...prev, [skillName]: rating }));
  }

  function handlePractice() {
    if (!prioritySkill) return;
    saveSelectedGap({
      skill: prioritySkill,
      confidenceRating: ratings[prioritySkill.name] ?? DEFAULT_RATING,
    });
    router.push("/learn");
  }

  if (checkedStorage && !session) {
    return (
      <PageShell step="gap">
        <div className="flex flex-col items-center gap-4 py-10 text-center">
          <MascotSays mood="thinking">
            I can&apos;t find a job description for this session. Let&apos;s start from the top.
          </MascotSays>
          <Button size="lg" className="clay-press rounded-xl font-bold" onClick={() => router.push("/job")}>
            Back to start
          </Button>
        </div>
      </PageShell>
    );
  }

  if (!session) {
    return (
      <PageShell step="gap">
        <div className="text-muted-foreground py-16 text-center text-sm">Loading...</div>
      </PageShell>
    );
  }

  const allSkillNames = session.skills.map((s) => s.name);
  const practicedCount = allSkillNames.filter((n) => practicedSkills.includes(n)).length;
  const allPracticed = practicedCount === allSkillNames.length;

  return (
    <PageShell step="gap" xp={xp}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            How confident are you?
          </h1>
          <MascotSays mood="thinking">
            Rate each skill this job asks for. I&apos;ll spot the one that&apos;s costing you the
            most — high importance, low confidence — and we&apos;ll start there.
          </MascotSays>
        </div>

        <XpBar
          value={practicedCount}
          max={allSkillNames.length}
          label="Skills practiced"
          caption={`${practicedCount} of ${allSkillNames.length}`}
          tone="success"
        />

        <div className="flex flex-col gap-3">
          {session.skills.map((skill) => {
            const isPriority = skill.name === priorityName;
            const isPracticed = practicedSkills.includes(skill.name);
            const rating = ratings[skill.name] ?? DEFAULT_RATING;

            return (
              <Card
                key={skill.name}
                onClick={() => setOverrideSkill(skill.name)}
                className={cn(
                  "cursor-pointer border-2 transition-all",
                  isPriority
                    ? "border-primary bg-accent/40 shadow-clay"
                    : "border-border hover:border-primary/40"
                )}
              >
                <CardContent className="flex flex-col gap-3 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold">{skill.name}</span>
                      {isPriority && (
                        <Badge className="animate-pop gap-1">
                          <Target className="size-3" aria-hidden="true" />
                          Priority
                        </Badge>
                      )}
                      {isPracticed && (
                        <Badge className="gap-1 bg-success text-success-foreground">
                          <Check className="size-3" aria-hidden="true" />
                          Practiced
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-1.5">
                      <Badge variant="secondary" className="text-[10px]">
                        {skill.type}
                      </Badge>
                      <Badge
                        variant={skill.importance === "high" ? "default" : "outline"}
                        className="text-[10px]"
                      >
                        {skill.importance}
                      </Badge>
                    </div>
                  </div>

                  <div
                    className="flex flex-col gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
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
                              "min-h-11 flex-1 cursor-pointer rounded-xl border-2 text-sm font-extrabold tabular-nums transition-all",
                              "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                              isSelected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-card hover:border-primary/50 hover:bg-accent/50"
                            )}
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>
                    <span className="text-muted-foreground text-xs font-semibold">
                      {RATING_LABELS[rating - 1]}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="border-2 border-primary bg-accent/30 shadow-clay">
          <CardContent className="flex flex-col gap-4 py-5">
            <div className="flex items-center gap-2">
              <Target className="size-5 text-primary" aria-hidden="true" />
              <span className="font-extrabold">Start with {prioritySkill?.name}</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              This is the biggest gap between what the job needs and how you rated yourself. Tap any
              other skill above to work on that one instead.
            </p>
            <Button
              size="lg"
              className="clay-press h-12 rounded-xl text-base font-extrabold"
              onClick={handlePractice}
              disabled={!prioritySkill}
            >
              <Sparkles className="size-5" aria-hidden="true" />
              Practice this skill
              <ArrowRight className="size-5" aria-hidden="true" />
            </Button>
          </CardContent>
        </Card>

        <Card
          className={cn(
            "border-2 transition-colors",
            allPracticed ? "border-success bg-success-muted/40" : "border-border"
          )}
        >
          <CardContent className="flex flex-col gap-3 py-5">
            <div className="flex items-center gap-2">
              {allPracticed ? (
                <Trophy className="size-5 text-success" aria-hidden="true" />
              ) : (
                <Lock className="text-locked size-5" aria-hidden="true" />
              )}
              <span className="font-extrabold">
                {allPracticed ? "Full interview unlocked" : "Full interview locked"}
              </span>
            </div>

            {allPracticed ? (
              <>
                <p className="text-sm leading-relaxed">
                  You&apos;ve practiced every skill from this job. Ready for the real thing — one
                  interview covering all of them?
                </p>
                <Button
                  size="lg"
                  className="clay-press h-12 rounded-xl bg-success text-success-foreground text-base font-extrabold hover:bg-success/90"
                  onClick={() => router.push("/interview/full")}
                >
                  <Trophy className="size-5" aria-hidden="true" />
                  Take the full interview
                </Button>
              </>
            ) : (
              <p className="text-muted-foreground text-sm leading-relaxed">
                Practice all {allSkillNames.length} skills to unlock a full mock interview that
                covers every one of them.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
