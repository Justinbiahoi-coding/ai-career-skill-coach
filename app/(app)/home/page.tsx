import Link from "next/link";
import { Button } from "@/components/ui/button";

// Placeholder: the real hub — greeting, function cards, sign-out — lands in Phase D.
export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10">
      <h1 className="text-2xl font-extrabold tracking-tight">Home</h1>
      <Button size="lg" className="clay-press h-12 rounded-xl font-extrabold" render={<Link href="/job" />}>
        Find your skill gap
      </Button>
    </main>
  );
}
