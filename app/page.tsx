"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Building2,
  ClipboardPaste,
  ExternalLink,
  Loader2,
  Search,
  Sparkles,
} from "lucide-react";
import { MascotSays } from "@/components/game/mascot-says";
import { PageShell } from "@/components/game/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { JOB_SUGGESTIONS, SAMPLE_JDS, normalizeForSearch } from "@/lib/fallback-data";
import { MAX_JD_LENGTH } from "@/lib/prompts";
import { saveExtractedSkills } from "@/lib/session-store";
import { cn } from "cn";
import type { ExtractSkillsResult, JobDescriptionResult, JobListing, JobSearchResult } from "@/lib/types";

export default function Home() {
  const router = useRouter();
  const [jdText, setJdText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [jobs, setJobs] = useState<JobListing[] | null>(null);
  const [searchNotice, setSearchNotice] = useState<string | null>(null);
  const [pickingJobId, setPickingJobId] = useState<string | null>(null);
  const [pickedJob, setPickedJob] = useState<JobListing | null>(null);

  // Lọc gợi ý ngay tại trình duyệt: tức thì, không gọi mạng theo từng phím gõ.
  // So khớp sau khi bỏ dấu để gõ "ke toan" vẫn ra "Kế toán".
  const suggestions = useMemo(() => {
    const typed = normalizeForSearch(query);
    if (!typed) return JOB_SUGGESTIONS.slice(0, 8);
    return JOB_SUGGESTIONS.filter((s) => normalizeForSearch(s).includes(typed)).slice(0, 8);
  }, [query]);

  // Nhận từ khoá qua tham số chứ không đọc từ state: khi bấm một gợi ý, state
  // `query` chưa kịp cập nhật (setState bất đồng bộ) nên sẽ tìm nhầm từ cũ.
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
      setSearchNotice("Couldn't reach the job sources. You can still paste a job description below.");
    } finally {
      setSearching(false);
    }
  }

  async function handlePickJob(job: JobListing) {
    setPickingJobId(job.id);
    setSearchNotice(null);

    try {
      // VietnamWorks/RemoteOK đã trả JD ngay khi search; ITviec phải tải
      // thêm trang chi tiết, nên chỉ gọi khi người dùng thật sự chọn job đó.
      let text = job.jdText;
      if (!text) {
        const res = await fetch(`/api/jobs/jd?url=${encodeURIComponent(job.url)}`);
        const data: JobDescriptionResult = await res.json();
        text = data.jdText;
      }

      if (!text) {
        setSearchNotice(
          "Couldn't read that job description automatically. Open the original posting and paste it below."
        );
        return;
      }

      setJdText(text);
      setPickedJob(job);
      setError(null);
    } catch {
      setSearchNotice(
        "Couldn't read that job description. Open the original posting and paste it below."
      );
    } finally {
      setPickingJobId(null);
    }
  }

  async function handleAnalyze() {
    if (!jdText.trim()) return;
    setLoading(true);
    setError(null);

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
      saveExtractedSkills({ jdText, skills: data.skills });
      router.push("/gap");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <PageShell step="job">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Find the gap between you
            <br />
            and the job you want.
          </h1>
          <MascotSays>
            Hi! Pick a real job that companies are hiring for right now. I&apos;ll work out which
            skill is holding you back, coach you through it, and put you through a mock interview.
          </MascotSays>
        </div>

        <Card className="clay-press">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Search className="size-4 text-primary" aria-hidden="true" />
              Find a real job
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex gap-2">
              <Input
                placeholder="e.g. data analyst, frontend developer, marketing"
                value={query}
                maxLength={100}
                aria-label="Job title to search for"
                className="h-11 rounded-xl"
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
              />
              {/* Bọc trong arrow function: nếu truyền thẳng handleSearch thì
                  React đưa object sự kiện vào tham số `term` thay vì chuỗi. */}
              <Button
                size="lg"
                className="h-11 rounded-xl px-5 font-bold"
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
                <span className="text-muted-foreground text-xs font-semibold">
                  {query.trim() ? "Suggestions:" : "Try:"}
                </span>
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleSearch(s)}
                    disabled={searching}
                    className="min-h-9 cursor-pointer rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold transition-colors hover:border-primary hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:opacity-60"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {searchNotice && (
              <p className="rounded-xl bg-warning-muted px-3 py-2 text-xs font-medium text-warning-foreground">
                {searchNotice}
              </p>
            )}

            {jobs && jobs.length === 0 && (
              <p className="text-muted-foreground text-sm">
                No jobs matched that search. Try a broader keyword, or paste a job description below.
              </p>
            )}

            {jobs && jobs.length > 0 && (
              <div className="flex flex-col gap-2">
                {jobs.map((job) => {
                  const isPicked = pickedJob?.id === job.id;
                  return (
                    <button
                      key={job.id}
                      type="button"
                      onClick={() => handlePickJob(job)}
                      disabled={pickingJobId !== null}
                      className={cn(
                        "flex cursor-pointer flex-col gap-1.5 rounded-2xl border-2 p-3.5 text-left transition-all",
                        "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:opacity-60",
                        isPicked
                          ? "border-primary bg-accent"
                          : "border-border bg-card hover:border-primary/50 hover:bg-accent/40"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-bold">{job.title}</span>
                        <Badge variant="outline" className="shrink-0 text-[10px]">
                          {job.source}
                        </Badge>
                      </div>
                      <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
                        <Building2 className="size-3.5" aria-hidden="true" />
                        {job.company}
                      </span>
                      {pickingJobId === job.id && (
                        <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                          <Loader2 className="size-3 animate-spin" aria-hidden="true" />
                          Loading job description...
                        </span>
                      )}
                      {isPicked && (
                        <span className="text-primary text-xs font-bold">
                          Loaded below — you can edit it before analyzing
                        </span>
                      )}
                    </button>
                  );
                })}

                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  Job listings are borrowed from public postings on VietnamWorks, ITviec, CareerLink,
                  TopDev and RemoteOK for this demo. All rights belong to the original sites and
                  employers.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="clay-press">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardPaste className="size-4 text-primary" aria-hidden="true" />
              {pickedJob ? "Review the job description" : "Or paste a job description"}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {pickedJob && (
              <a
                href={pickedJob.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground inline-flex w-fit items-center gap-1.5 text-xs font-semibold underline underline-offset-2 hover:text-foreground"
              >
                {pickedJob.company} on {pickedJob.source}
                <ExternalLink className="size-3" aria-hidden="true" />
              </a>
            )}

            <Textarea
              placeholder="Paste a job description here..."
              value={jdText}
              maxLength={MAX_JD_LENGTH}
              aria-label="Job description"
              onChange={(e) => setJdText(e.target.value)}
              className="min-h-[180px] rounded-xl text-sm leading-relaxed"
            />
            <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-bold tabular-nums">
                {jdText.length}/{MAX_JD_LENGTH}
              </span>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_JDS.map((sample) => (
                  <Button
                    key={sample.label}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-full font-semibold"
                    onClick={() => {
                      setJdText(sample.jdText);
                      setPickedJob(null);
                    }}
                  >
                    Try: {sample.label}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              size="lg"
              className="clay-press h-12 rounded-xl text-base font-extrabold"
              onClick={handleAnalyze}
              disabled={loading || !jdText.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                  Finding your skill gap...
                </>
              ) : (
                <>
                  <Sparkles className="size-5" aria-hidden="true" />
                  Analyze this job
                  <ArrowRight className="size-5" aria-hidden="true" />
                </>
              )}
            </Button>

            {error && (
              <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
                {error}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
