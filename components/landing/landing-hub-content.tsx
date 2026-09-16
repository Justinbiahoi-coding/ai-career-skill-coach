import Link from "next/link";
import { BookOpen, ClipboardList, MessagesSquare, Search, Trophy } from "lucide-react";
import { MascotSays } from "@/components/game/mascot-says";
import { StatPill } from "@/components/game/stat-pill";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * What a signed-in visitor sees at / instead of the marketing sections —
 * the former /home page, folded into the landing route so signing in
 * doesn't leave the site's look behind for a different app shell.
 */

const STEPS = [
  { icon: Search, title: "Find a real job", body: "Search live postings, or paste a description." },
  { icon: ClipboardList, title: "Spot your gap", body: "Rate each skill the job asks for." },
  { icon: BookOpen, title: "Practice it", body: "A lesson and an exercise built around that job." },
  { icon: MessagesSquare, title: "Mock interview", body: "Answer out loud, like the real thing." },
  { icon: Trophy, title: "See where you stand", body: "Scored, with what to fix next." },
] as const;

export interface LandingHubContentProps {
  greetingName: string;
  xp: number;
}

export function LandingHubContent({ greetingName, xp }: LandingHubContentProps) {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-extrabold tracking-tight break-words sm:text-3xl">
          Welcome back, {greetingName}
        </h1>
        {xp > 0 && <StatPill tone="xp" value={xp} label={`${xp} XP earned`} />}
      </div>

      <MascotSays mood="default">
        Ready when you are. Pick a job you&apos;d actually apply for — the closer to real, the more
        useful everything after it gets.
      </MascotSays>

      <Card className="clay-press border-2 border-primary bg-accent/30">
        <CardContent className="flex flex-col gap-4 py-6">
          <div className="flex flex-col gap-1.5">
            <span className="text-lg font-extrabold">Start with a real job</span>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Everything else follows from this — the lesson, the exercise and the interview are all
              built around the posting you choose.
            </p>
          </div>
          <Button
            size="lg"
            className="clay-press h-12 rounded-xl text-base font-extrabold"
            // Link renders an <a>, not a native <button>; nativeButton must be
            // false or Base UI assumes button semantics that aren't there.
            nativeButton={false}
            render={<Link href="/job" />}
          >
            <Search className="size-5" aria-hidden="true" />
            Find a job
          </Button>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
          How it works
        </h2>
        {STEPS.map(({ icon: Icon, title, body }, i) => (
          <div key={title} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-3.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
              <Icon className="size-4.5" aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-bold">
                {i + 1}. {title}
              </span>
              <span className="text-muted-foreground text-xs leading-relaxed">{body}</span>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
