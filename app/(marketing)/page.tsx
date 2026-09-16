import type { Metadata } from "next";
import { LandingNavbar } from "@/components/landing/landing-navbar";
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
    "Scan live job descriptions from VietnamWorks, ITviec, TopDev; discover your skill gaps, practice bite-sized 5-minute micro-lessons, and conduct voice mock interviews with AI. Built by Team 24 for Global Hackathon 2026.",
};

// Signing in doesn't change what this page shows — the same marketing
// sections stay, since they double as the feature tour a signed-in visitor
// scrolls to reach each tool. Only the navbar changes: it swaps Sign In /
// Get Started for the app's own destinations. Keeping one page for both
// states avoids a second, differently-styled "hub" screen that would break
// the site's look the moment someone logs in.
export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-background text-foreground scroll-smooth flex flex-col">
      <LandingNavbar userEmail={user?.email} />

      <main className="flex-1">
        <LandingHero isSignedIn={Boolean(user)} />
        <LandingOverview />
        <LandingHowItWorks />
        <LandingFeatures />
        <LandingAiSpec />
        <LandingTeam />
        <LandingCtaBanner isSignedIn={Boolean(user)} />
      </main>

      {/* NOTE: Strictly NO <footer> tag here as per explicit requirement */}
    </div>
  );
}
