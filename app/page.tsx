"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SAMPLE_JDS } from "@/lib/fallback-data";
import type { ExtractSkillsResult } from "@/lib/types";

const MAX_JD_LENGTH = 3000;

export default function Home() {
  const [jdText, setJdText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExtractSkillsResult | null>(null);

  async function handleAnalyze() {
    if (!jdText.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

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
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10">
      <div className="flex flex-col gap-2 text-center sm:text-left">
        <h1 className="text-2xl font-semibold tracking-tight">AI Career Skill Coach</h1>
        <p className="text-muted-foreground text-sm">
          Paste a real job description. We&apos;ll find the skill gap, help you practice it, and
          run a mock interview to see how ready you really are.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">1. Paste a job description</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Textarea
            placeholder="Paste a job description here..."
            value={jdText}
            maxLength={MAX_JD_LENGTH}
            onChange={(e) => setJdText(e.target.value)}
            className="min-h-[180px]"
          />
          <div className="text-muted-foreground flex items-center justify-between text-xs">
            <span>{jdText.length}/{MAX_JD_LENGTH}</span>
            <div className="flex gap-2">
              {SAMPLE_JDS.map((sample) => (
                <Button
                  key={sample.label}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setJdText(sample.jdText)}
                >
                  Use sample: {sample.label}
                </Button>
              ))}
            </div>
          </div>

          <Button onClick={handleAnalyze} disabled={loading || !jdText.trim()}>
            {loading ? "Analyzing..." : "Analyze"}
          </Button>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Skills found in this job description</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {result.usedFallback && (
              <p className="text-sm text-amber-600">
                The AI analysis failed, so this is offline sample data instead.
              </p>
            )}
            {result.skills.map((skill, i) => (
              <div key={skill.name}>
                {i > 0 && <Separator className="mb-3" />}
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{skill.name}</span>
                  <div className="flex gap-2">
                    <Badge variant="secondary">{skill.type}</Badge>
                    <Badge
                      variant={skill.importance === "high" ? "default" : "outline"}
                    >
                      {skill.importance}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
