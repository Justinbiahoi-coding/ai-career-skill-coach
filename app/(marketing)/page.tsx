import type { Metadata } from "next";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingOverview } from "@/components/landing/landing-overview";
import { LandingHowItWorks } from "@/components/landing/landing-how-it-works";
import { LandingFeatures } from "@/components/landing/landing-features";
import { LandingAiSpec } from "@/components/landing/landing-ai-spec";
import { LandingTeam } from "@/components/landing/landing-team";
import { LandingCtaBanner } from "@/components/landing/landing-cta-banner";

export const metadata: Metadata = {
  title: "Joblingo — AI Career Skill Coach | Skill Gap Discovery & Voice Mock Interviews",
  description:
    "Scan live job descriptions from VietnamWorks, ITviec, TopDev; discover your skill gaps, practice bite-sized 5-minute micro-lessons, and conduct voice mock interviews with AI. Built by Team 15 for Global Hackathon 2026.",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground scroll-smooth flex flex-col">
      {/* 1. Independent Landing Page Navbar */}
      <LandingNavbar />

      {/* 2. Main Landing Page Sections */}
      <main className="flex-1">
        {/* Hero Section */}
        <LandingHero />

        {/* Section 1: Overview & Problem vs Solution (Z-pattern) */}
        <LandingOverview />

        {/* Section 2: 5-Step Closed Loop Stepper */}
        <LandingHowItWorks />

        {/* Section 3: Core Features Bento Grid */}
        <LandingFeatures />

        {/* Section 4: Responsible AI Architecture Spec */}
        <LandingAiSpec />

        {/* Section 5: Team 15 & Mentors Showcase */}
        <LandingTeam />

        {/* Section 6: High-impact Closing CTA (STRICTLY NO FOOTER) */}
        <LandingCtaBanner />
      </main>

      {/* NOTE: Strictly NO <footer> tag here as per explicit requirement */}
    </div>
  );
}
