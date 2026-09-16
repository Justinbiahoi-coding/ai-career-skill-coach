"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

/**
 * One form that both signs in and signs up.
 *
 * Students arriving at a demo don't know whether they have an account, and
 * making them choose a tab first is a needless decision. So: try to sign in,
 * and if the credentials don't match an existing account, offer to create one
 * rather than showing a dead end.
 */

interface SignInFormProps {
  /** Where to go after signing in — set by the proxy when it bounced you here. */
  next?: string;
}

export function SignInForm({ next }: SignInFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offerSignUp, setOfferSignUp] = useState(false);

  // "/" only, not "//evil.com" or "/\evil.com" — both are parsed by browsers
  // as protocol-relative URLs to another origin, not an internal path.
  const isSafeInternalPath = (path: string) => path.startsWith("/") && !/^\/[\\/]/.test(path);
  const destination = next && isSafeInternalPath(next) ? next : "/home";

  function goToApp() {
    router.push(destination);
    // Without refresh() the server keeps rendering with the signed-out
    // session it already has, and the proxy bounces you straight back here.
    router.refresh();
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);
    setOfferSignUp(false);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!signInError) {
      goToApp();
      return;
    }

    // Supabase returns the same message whether the email is unknown or the
    // password is wrong, so offer sign-up rather than guessing which it was.
    if (signInError.message.toLowerCase().includes("invalid login credentials")) {
      setError("No account matched that email and password.");
      setOfferSignUp(true);
    } else {
      setError(signInError.message);
    }
    setLoading(false);
  }

  async function handleSignUp() {
    if (loading) return;
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({ email, password });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    goToApp();
  }

  return (
    <form onSubmit={handleSignIn} className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-bold">
          Email
        </label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="h-11 rounded-xl"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-bold">
          Password
        </label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          autoComplete="current-password"
          placeholder="At least 6 characters"
          className="h-11 rounded-xl"
        />
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-xl bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive"
        >
          {error}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        className="clay-press h-12 rounded-xl text-base font-extrabold"
        disabled={loading || !email.trim() || !password.trim()}
      >
        {loading ? (
          <Loader2 className="size-5 animate-spin" aria-hidden="true" />
        ) : (
          <LogIn className="size-5" aria-hidden="true" />
        )}
        {loading ? "Signing in..." : "Sign in"}
      </Button>

      {offerSignUp && (
        <Button
          type="button"
          size="lg"
          variant="outline"
          className="h-12 rounded-xl font-bold"
          onClick={handleSignUp}
          disabled={loading}
        >
          Create an account with this email
        </Button>
      )}
    </form>
  );
}
