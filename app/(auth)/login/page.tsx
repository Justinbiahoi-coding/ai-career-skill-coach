"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { safeRedirectPath } from "@/lib/utils";
import { motion } from "motion/react";
import { ArrowRight, Loader2, AlertCircle, Sparkles } from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = safeRedirectPath(searchParams.get("next"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      if (data.session) {
        router.push(nextPath);
        router.refresh();
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-sky-wash flex flex-col items-center justify-center p-6 overflow-hidden select-none">
      {/* Floating 2D Multi-Colored Stickers with Continuous Float */}
      <motion.div
        animate={{ y: [-8, 8, -8], rotate: [-14, -8, -14] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
        className="hidden md:flex absolute top-16 left-[10%] items-center gap-2 rounded-[20px] border border-carbon bg-ember px-4 py-2 text-paper-white text-xs font-bold tracking-[0.032em]"
      >
        <span>🚀</span>
        <span>Career Ready</span>
      </motion.div>

      <motion.div
        animate={{ y: [8, -8, 8], rotate: [10, 15, 10] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
        className="hidden md:flex absolute top-20 right-[12%] items-center gap-2 rounded-[20px] border border-carbon bg-sunburst px-4 py-2 text-carbon text-xs font-bold tracking-[0.032em]"
      >
        <span>🪙</span>
        <span>XP &amp; Streaks</span>
      </motion.div>

      <motion.div
        animate={{ y: [-6, 6, -6], rotate: [-6, 0, -6] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
        className="hidden md:flex absolute bottom-16 right-[14%] items-center gap-2 rounded-[20px] border border-carbon bg-mint-pop px-4 py-2 text-carbon text-xs font-bold tracking-[0.032em]"
      >
        <span>✓</span>
        <span>Real JDs</span>
      </motion.div>

      {/* Main Hand-cut Auth Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md rounded-[32px] border border-carbon bg-paper-white p-8 sm:p-10 text-carbon shadow-none z-10"
      >
        {/* Brand Logo Header */}
        <div className="flex items-center justify-between pb-6 border-b border-carbon mb-6">
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className="flex size-11 items-center justify-center rounded-full border border-carbon bg-paper-white text-carbon font-extrabold text-xl font-lateral"
            >
              J
            </motion.div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-carbon">
                Joblingo
              </span>
              <span className="rounded-full border border-carbon bg-sunburst px-2 py-0.5 text-[10px] font-bold text-carbon">
                AI
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="text-xs font-bold text-carbon/60 hover:text-carbon transition-colors"
          >
            ← Home
          </Link>
        </div>

        {/* Display Title */}
        <div className="text-left mb-6">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-carbon bg-lavender px-3 py-1 text-[11px] font-bold tracking-[0.032em] text-carbon mb-3">
            <Sparkles className="size-3" />
            <span>AUTHENTICATION</span>
          </div>
          <h1 className="font-lateral text-4xl sm:text-5xl font-extrabold uppercase leading-[0.82] text-carbon">
            WELCOME BACK
          </h1>
          <p className="mt-3 font-aeonik text-sm font-medium text-carbon/75 leading-relaxed">
            Sign in to continue your skill gap analysis and voice mock interviews.
          </p>
        </div>

        {/* Error Feedback Message */}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 flex items-start gap-2.5 rounded-[16px] border border-carbon bg-ember/15 p-3.5 text-xs font-bold text-carbon"
          >
            <AlertCircle className="size-4 shrink-0 text-ember mt-0.5" />
            <span>{errorMsg}</span>
          </motion.div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs font-bold tracking-[0.032em] uppercase text-carbon/80">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={loading}
              className="w-full rounded-[16px] border border-carbon bg-paper-white px-4 py-3 text-sm font-medium text-carbon placeholder:text-carbon/35 focus:outline-none focus:ring-2 focus:ring-carbon transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold tracking-[0.032em] uppercase text-carbon/80">
                Password
              </label>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              className="w-full rounded-[16px] border border-carbon bg-paper-white px-4 py-3 text-sm font-medium text-carbon placeholder:text-carbon/35 focus:outline-none focus:ring-2 focus:ring-carbon transition-all"
            />
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="mt-2 w-full cursor-pointer rounded-full border border-carbon bg-carbon py-3.5 px-6 text-sm font-bold tracking-[0.032em] text-paper-white flex items-center justify-center gap-2 hover:bg-carbon/90 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin text-paper-white" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="size-4" />
              </>
            )}
          </motion.button>
        </form>

        {/* Footer Link to Register */}
        <div className="mt-8 pt-5 border-t border-carbon/20 text-center text-xs font-medium text-carbon/75">
          Don&apos;t have an account yet?{" "}
          <Link
            href={`/register${nextPath !== "/" ? `?next=${encodeURIComponent(nextPath)}` : ""}`}
            className="font-bold text-carbon underline decoration-carbon underline-offset-4 hover:opacity-80"
          >
            Create one free
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen w-full bg-sky-wash" />}>
      <LoginContent />
    </Suspense>
  );
}
