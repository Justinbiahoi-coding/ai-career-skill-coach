"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { loadExtractedSkills, loadSelectedGap } from "@/lib/session-store";
import type { GenerateLessonResult, GradeExerciseResult, Skill } from "@/lib/types";

const MAX_ANSWER_LENGTH = 2000;

interface LearnContext {
  skill: Skill;
  jdText: string;
}

export default function LearnPage() {
  const router = useRouter();
  const [context, setContext] = useState<LearnContext | null>(null);
  const [checkedStorage, setCheckedStorage] = useState(false);

  const [lesson, setLesson] = useState<GenerateLessonResult | null>(null);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [lessonError, setLessonError] = useState<string | null>(null);

  const [answer, setAnswer] = useState("");
  const [grade, setGrade] = useState<GradeExerciseResult | null>(null);
  const [gradeLoading, setGradeLoading] = useState(false);
  const [gradeError, setGradeError] = useState<string | null>(null);

  useEffect(() => {
    const selectedGap = loadSelectedGap();
    const extracted = loadExtractedSkills();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setContext(
      selectedGap && extracted ? { skill: selectedGap.skill, jdText: extracted.jdText } : null
    );
    setCheckedStorage(true);
  }, []);

  useEffect(() => {
    if (!context) return;

    let cancelled = false;
    // Reset loading/error state right as the fetch starts (standard data-fetch
    // pattern) — the actual result is set later inside the async .then/.catch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLessonLoading(true);
    setLessonError(null);

    fetch("/api/generate-lesson", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skillName: context.skill.name, jdText: context.jdText }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? "Request failed");
        }
        return res.json();
      })
      .then((data: GenerateLessonResult) => {
        if (!cancelled) setLesson(data);
      })
      .catch((err) => {
        if (!cancelled) setLessonError(err instanceof Error ? err.message : "Something went wrong");
      })
      .finally(() => {
        if (!cancelled) setLessonLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [context]);

  async function handleSubmitAnswer() {
    if (!context || !lesson || !answer.trim()) return;
    setGradeLoading(true);
    setGradeError(null);

    try {
      const res = await fetch("/api/grade-exercise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skillName: context.skill.name,
          exercisePrompt: lesson.exercisePrompt,
          userAnswer: answer,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Request failed");
      }

      const data: GradeExerciseResult = await res.json();
      setGrade(data);
    } catch (err) {
      setGradeError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setGradeLoading(false);
    }
  }

  function handleGoToInterview() {
    router.push("/interview");
  }

  if (checkedStorage && !context) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 px-4 py-16 text-center">
        <p className="text-muted-foreground text-sm">
          No skill selected for this session. Start from the beginning.
        </p>
        <Button onClick={() => router.push("/")}>Back to start</Button>
      </div>
    );
  }

  if (!context) {
    return (
      <div className="mx-auto flex w-full max-w-2xl px-4 py-16 text-center text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10">
      <div className="flex flex-col gap-2 text-center sm:text-left">
        <div className="flex items-center justify-center gap-2 sm:justify-start">
          <h1 className="text-2xl font-semibold tracking-tight">3. Practice</h1>
          <Badge>{context.skill.name}</Badge>
        </div>
        <p className="text-muted-foreground text-sm">
          A short lesson and one exercise focused on this skill only.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lesson</CardTitle>
        </CardHeader>
        <CardContent>
          {lessonLoading && <p className="text-muted-foreground text-sm">Preparing your lesson...</p>}
          {lessonError && <p className="text-sm text-red-600">{lessonError}</p>}
          {lesson && (
            <div className="flex flex-col gap-3">
              {lesson.usedFallback && (
                <p className="text-sm text-amber-600">
                  The AI coach failed, so this is offline sample content instead.
                </p>
              )}
              <p className="whitespace-pre-line text-sm leading-relaxed">{lesson.lessonText}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {lesson && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Exercise</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm">{lesson.exercisePrompt}</p>
            <Textarea
              placeholder="Write your answer here..."
              value={answer}
              maxLength={MAX_ANSWER_LENGTH}
              onChange={(e) => setAnswer(e.target.value)}
              className="min-h-[140px]"
            />
            <Button onClick={handleSubmitAnswer} disabled={gradeLoading || !answer.trim()}>
              {gradeLoading ? "Grading..." : "Submit answer"}
            </Button>
            {gradeError && <p className="text-sm text-red-600">{gradeError}</p>}

            {grade && (
              <div className="flex flex-col gap-2 border-t pt-4">
                {grade.usedFallback && (
                  <p className="text-sm text-amber-600">
                    The AI grader failed, so this is a placeholder score instead.
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <span className="font-medium">Score:</span>
                  <Badge variant={grade.score >= 7 ? "default" : "outline"}>{grade.score}/10</Badge>
                </div>
                <p className="text-sm leading-relaxed">{grade.feedback}</p>
                <Button variant="outline" onClick={handleGoToInterview} className="mt-2">
                  Ready for a mock interview
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
