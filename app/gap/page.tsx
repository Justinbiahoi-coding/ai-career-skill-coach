"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "cn";
import {
  loadExtractedSkills,
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

export default function GapPage() {
  const router = useRouter();
  const [session, setSession] = useState<ExtractedSkillsSession | null>(null);
  const [checkedStorage, setCheckedStorage] = useState(false);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [overrideSkill, setOverrideSkill] = useState<string | null>(null);

  useEffect(() => {
    // sessionStorage chỉ đọc được ở client; SSR không có window, nên phải
    // đọc trong effect thay vì lúc render để tránh hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSession(loadExtractedSkills());
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
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 px-4 py-16 text-center">
        <p className="text-muted-foreground text-sm">
          No job description found for this session. Start by pasting one.
        </p>
        <Button onClick={() => router.push("/")}>Back to start</Button>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="mx-auto flex w-full max-w-2xl px-4 py-16 text-center text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10">
      <div className="flex flex-col gap-2 text-center sm:text-left">
        <h1 className="text-2xl font-semibold tracking-tight">2. Rate your confidence</h1>
        <p className="text-muted-foreground text-sm">
          For each skill this job needs, rate how confident you feel right now (1 = not at all,
          5 = very confident). We&apos;ll highlight the one gap worth practicing first — you can
          pick a different one if you disagree.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {session.skills.map((skill) => {
          const isPriority = skill.name === priorityName;
          const rating = ratings[skill.name] ?? DEFAULT_RATING;

          return (
            <Card
              key={skill.name}
              onClick={() => setOverrideSkill(skill.name)}
              className={cn(
                "cursor-pointer transition-colors",
                isPriority && "border-primary ring-1 ring-primary"
              )}
            >
              <CardContent className="flex flex-col gap-3 py-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{skill.name}</span>
                    {isPriority && <Badge>Priority</Badge>}
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary">{skill.type}</Badge>
                    <Badge variant={skill.importance === "high" ? "default" : "outline"}>
                      {skill.importance}
                    </Badge>
                  </div>
                </div>

                <div
                  className="flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-muted-foreground text-xs">Confidence:</span>
                  {[1, 2, 3, 4, 5].map((value) => (
                    <Button
                      key={value}
                      type="button"
                      size="xs"
                      variant={rating === value ? "default" : "outline"}
                      onClick={() => handleRate(skill.name, value)}
                    >
                      {value}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your priority gap</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm">
            <span className="font-medium">{prioritySkill?.name}</span> — this is where we&apos;ll
            focus first. Click any skill above to practice that one instead.
          </p>
          <Button onClick={handlePractice} disabled={!prioritySkill}>
            Practice this skill
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
