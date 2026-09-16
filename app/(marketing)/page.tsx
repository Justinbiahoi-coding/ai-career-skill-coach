import Link from "next/link";
import { Button } from "@/components/ui/button";

// Placeholder: the welcome screen and sign-in form land here in Phase C.
export default function WelcomePage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-3xl font-extrabold tracking-tight">AI Career Skill Coach</h1>
      <Button size="lg" className="clay-press h-12 rounded-xl font-extrabold" render={<Link href="/home" />}>
        Continue
      </Button>
    </main>
  );
}
