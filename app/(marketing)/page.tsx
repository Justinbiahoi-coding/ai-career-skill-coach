import type { Metadata } from "next";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { LandingHubContent } from "@/components/landing/landing-hub-content";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingOverview } from "@/components/landing/landing-overview";
import { LandingHowItWorks } from "@/components/landing/landing-how-it-works";
import { LandingFeatures } from "@/components/landing/landing-features";
import { LandingAiSpec } from "@/components/landing/landing-ai-spec";
import { LandingTeam } from "@/components/landing/landing-team";
import { LandingCtaBanner } from "@/components/landing/landing-cta-banner";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Joblingo — AI Career Skill Coach | Skill Gap Discovery & Voice Mock Interviews",
  description:
    "Scan live job descriptions from VietnamWorks, ITviec, TopDev; discover your skill gaps, practice bite-sized 5-minute micro-lessons, and conduct voice mock interviews with AI. Built by Team 15 for Global Hackathon 2026.",
};

// / now serves two audiences: the marketing site below for a first-time
// visitor, and the app hub for someone already signed in. Folding /home into
// / (rather than keeping them as two routes proxy.ts bounced between) means
// signing in doesn't swap out the site's shell for a different-looking app —
// the navbar and background stay put, only its content changes.
export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let xp = 0;
  if (user) {
    // Best-effort read: a missing profile row (first sign-in, before any XP
    // is earned) or an RLS/network hiccup should show "0 XP", not break the
    // page — same reasoning the old /home page used.
    const { data: profile } = await supabase
      .from("profiles")
      .select("xp")
      .eq("id", user.id)
      .maybeSingle();
    xp = profile?.xp ?? 0;
  }

  return (
    <div className="min-h-screen bg-background text-foreground scroll-smooth flex flex-col">
      <LandingNavbar userEmail={user?.email} />

      {user ? (
        <LandingHubContent greetingName={user.email?.split("@")[0] ?? "there"} xp={xp} />
      ) : (
        <main className="flex-1">
          <LandingHero />
          <LandingOverview />
          <LandingHowItWorks />
          <LandingFeatures />
          <LandingAiSpec />
          <LandingTeam />
          <LandingCtaBanner />
        </main>
      )}

      {/* NOTE: Strictly NO <footer> tag here as per explicit requirement */}
    </div>
  );
}
