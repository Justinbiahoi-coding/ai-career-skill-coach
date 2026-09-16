import { GraduationCap } from "lucide-react";
import { SignInForm } from "@/components/auth/sign-in-form";
import { Mascot } from "@/components/mascot";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Sign in — AI Career Skill Coach",
};

/**
 * The opening screen.
 *
 * Signed-in visitors never reach it — proxy.ts redirects them to /home — so
 * this only has to do one job well: say what the product is, then let someone
 * in. PageShell is deliberately not used here; its journey bar would be
 * claiming progress through a flow the visitor hasn't started.
 */
export default async function WelcomePage({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : undefined;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-6 px-4 py-10">
      <div className="flex flex-col items-center gap-4 text-center">
        <Mascot mood="happy" size="lg" priority decorative />

        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <GraduationCap className="size-5" aria-hidden="true" />
          </span>
          <span className="text-lg font-extrabold tracking-tight">Skill Coach</span>
        </div>

        <h1 className="text-2xl font-extrabold tracking-tight text-balance sm:text-3xl">
          Find the gap between you and the job you want.
        </h1>

        <p className="text-muted-foreground text-sm leading-relaxed text-pretty">
          Pick a real job companies are hiring for. We&apos;ll find the skill holding you back,
          coach you through it, and interview you on it — so you know where you stand before it
          counts.
        </p>
      </div>

      <Card className="clay-press">
        <CardContent className="py-6">
          <SignInForm next={next} />
        </CardContent>
      </Card>

      <p className="text-muted-foreground text-center text-xs leading-relaxed">
        Signing in keeps your progress and XP across sessions.
      </p>
    </main>
  );
}
