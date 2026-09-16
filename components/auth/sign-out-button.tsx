"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    if (loading) return;
    setLoading(true);

    const supabase = createClient();
    await supabase.auth.signOut();

    router.push("/");
    // Drops the server's cached render of this page, which still holds the
    // signed-in user; without it the old greeting survives the navigation.
    router.refresh();
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-11 shrink-0 rounded-full font-bold"
      onClick={handleSignOut}
      disabled={loading}
    >
      <LogOut className="size-4" aria-hidden="true" />
      {loading ? "Signing out" : "Sign out"}
    </Button>
  );
}
