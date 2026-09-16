"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { JOB_SUGGESTIONS, SAMPLE_JDS, normalizeForSearch } from "@/lib/fallback-data";
import { MAX_JD_LENGTH } from "@/lib/prompts";
import { saveExtractedSkills } from "@/lib/session-store";
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
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10">
      <div className="flex flex-col gap-2 text-center sm:text-left">
        <h1 className="text-2xl font-semibold tracking-tight">AI Career Skill Coach</h1>
        <p className="text-muted-foreground text-sm">
          Search a real job that companies are hiring for right now. We&apos;ll find your skill
          gap, help you practice it, and run a mock interview to see how ready you really are.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">1. Find a real job</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Input
              placeholder="e.g. data analyst, frontend developer, marketing"
              value={query}
              maxLength={100}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
            />
            {/* Bọc trong arrow function: nếu truyền thẳng handleSearch thì
                React đưa object sự kiện vào tham số `term` thay vì chuỗi. */}
            <Button onClick={() => handleSearch()} disabled={searching || !query.trim()}>
              {searching ? "Searching..." : "Search"}
            </Button>
          </div>

          {suggestions.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-muted-foreground text-xs">
                {query.trim() ? "Suggestions:" : "Try:"}
              </span>
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSearch(s)}
                  disabled={searching}
                  className="border-input hover:bg-muted rounded-full border px-2.5 py-1 text-xs transition-colors disabled:opacity-60"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {searchNotice && <p className="text-muted-foreground text-xs">{searchNotice}</p>}

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
                    className={`flex flex-col gap-1 rounded-md border p-3 text-left transition-colors disabled:opacity-60 ${
                      isPicked ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-medium">{job.title}</span>
                      <Badge variant="outline" className="shrink-0 text-[10px]">
                        {job.source}
                      </Badge>
                    </div>
                    <span className="text-muted-foreground text-xs">{job.company}</span>
                    {pickingJobId === job.id && (
                      <span className="text-muted-foreground text-xs">
                        Loading job description...
                      </span>
                    )}
                    {isPicked && (
                      <span className="text-primary text-xs">
                        ✓ Loaded below — you can edit it before analyzing
                      </span>
                    )}
                  </button>
                );
              })}

              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Job listings are borrowed from public postings on VietnamWorks, ITviec and RemoteOK
                for this demo. All rights belong to the original sites and employers.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            2. {pickedJob ? "Review the job description" : "Or paste a job description"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {pickedJob && (
            <p className="text-muted-foreground text-xs">
              From{" "}
              <a
                href={pickedJob.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                {pickedJob.company} on {pickedJob.source}
              </a>
            </p>
          )}

          <Textarea
            placeholder="Paste a job description here..."
            value={jdText}
            maxLength={MAX_JD_LENGTH}
            onChange={(e) => setJdText(e.target.value)}
            className="min-h-[180px]"
          />
          <div className="text-muted-foreground flex items-center justify-between text-xs">
            <span>
              {jdText.length}/{MAX_JD_LENGTH}
            </span>
            <div className="flex gap-2">
              {SAMPLE_JDS.map((sample) => (
                <Button
                  key={sample.label}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setJdText(sample.jdText);
                    setPickedJob(null);
                  }}
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
    </div>
  );
}
