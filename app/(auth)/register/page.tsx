"use client";

import { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createProfile } from "@/lib/profile";
import { safeRedirectPath } from "@/lib/utils";
import { motion } from "motion/react";
import { ArrowRight, Loader2, AlertCircle, CheckCircle2, Sparkles } from "lucide-react";
import { GENDER_OPTIONS, MAX_DISPLAY_NAME_LENGTH } from "@/lib/types";
import type { Gender } from "@/lib/types";
import { cn } from "cn";

const GENDER_LABELS: Record<Gender, string> = { female: "Female", male: "Male", other: "Other" };

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = safeRedirectPath(searchParams.get("next"));

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState<Gender | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim() || !password || !fullName.trim() || !gender) {
      setErrorMsg("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      const redirectUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`
          : undefined;

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        // Best-effort: a failed profile write shouldn't block account
        // creation — the navbar just falls back to showing nothing until
        // the user is re-prompted (out of scope here) or a mentor fixes it.
        await createProfile(data.user.id, fullName, gender).catch(() => {});
      }

      // If Supabase has email confirmation disabled, a session is immediately established
      if (data.session) {
        router.push(nextPath);
        router.refresh();
        return;
      }

      // If email confirmation is required by Supabase
      if (data.user) {
        setSuccessMsg(
          "Account created successfully! Please check your email inbox to verify your account."
        );
        setLoading(false);
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
        animate={{ y: [-8, 8, -8], rotate: [-12, -6, -12] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        className="hidden md:flex absolute top-16 left-[12%] items-center gap-2 rounded-[20px] border border-carbon bg-sunburst px-4 py-2 text-carbon text-xs font-bold tracking-[0.032em]"
      >
        <span>🪙</span>
        <span>Free Forever</span>
      </motion.div>

      <motion.div
        animate={{ y: [8, -8, 8], rotate: [8, 14, 8] }}
        transition={{ duration: 5.0, repeat: Infinity, ease: "easeInOut" }}
        className="hidden md:flex absolute top-20 right-[10%] items-center gap-2 rounded-[20px] border border-carbon bg-mint-pop px-4 py-2 text-carbon text-xs font-bold tracking-[0.032em]"
      >
        <span>✓</span>
        <span>No Credit Card</span>
      </motion.div>

      <motion.div
        animate={{ y: [-6, 6, -6], rotate: [-8, 0, -8] }}
        transition={{ duration: 3.9, repeat: Infinity, ease: "easeInOut" }}
        className="hidden md:flex absolute bottom-16 left-[14%] items-center gap-2 rounded-[20px] border border-carbon bg-voltage-violet px-4 py-2 text-paper-white text-xs font-bold tracking-[0.032em]"
      >
        <span>👛</span>
        <span>Hands-Free AI</span>
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
              className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-carbon bg-paper-white"
            >
              <Image src="/brand/joblingo-logo.webp" alt="Joblingo" fill sizes="44px" className="object-cover" />
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
          <div className="inline-flex items-center gap-1.5 rounded-full border border-carbon bg-sunburst px-3 py-1 text-[11px] font-bold tracking-[0.032em] text-carbon mb-3">
            <Sparkles className="size-3" />
            <span>START FREE TODAY</span>
          </div>
          <h1 className="font-lateral text-4xl sm:text-5xl font-extrabold uppercase leading-[0.82] text-carbon">
            JOIN JOBLINGO
          </h1>
          <p className="mt-3 font-aeonik text-sm font-medium text-carbon/75 leading-relaxed">
            Create your account to track skills, build streaks, and practice live mock interviews.
          </p>
        </div>

        {/* Success Confirmation Alert */}
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 flex items-start gap-2.5 rounded-[16px] border border-carbon bg-mint-pop/30 p-3.5 text-xs font-bold text-carbon"
          >
            <CheckCircle2 className="size-4 shrink-0 text-carbon mt-0.5" />
            <span>{successMsg}</span>
          </motion.div>
        )}

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

        {/* Registration Form */}
        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5 text-left">
            <div className="flex items-baseline justify-between">
              <label className="text-xs font-bold tracking-[0.032em] uppercase text-carbon/80">
                Display Name
              </label>
              <span className="font-aeonik text-[11px] font-bold text-carbon/40">
                {fullName.length}/{MAX_DISPLAY_NAME_LENGTH}
              </span>
            </div>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value.slice(0, MAX_DISPLAY_NAME_LENGTH))}
              placeholder="e.g. Thien"
              maxLength={MAX_DISPLAY_NAME_LENGTH}
              required
              disabled={loading}
              className="w-full rounded-[16px] border border-carbon bg-paper-white px-4 py-3 text-sm font-medium text-carbon placeholder:text-carbon/35 focus:outline-none focus:ring-2 focus:ring-carbon transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs font-bold tracking-[0.032em] uppercase text-carbon/80">
              Gender
            </label>
            <div role="radiogroup" aria-label="Gender" className="grid grid-cols-3 gap-2">
              {GENDER_OPTIONS.map((option) => {
                const isSelected = gender === option;
                return (
                  <button
                    key={option}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    disabled={loading}
                    onClick={() => setGender(option)}
                    className={cn(
                      "min-h-11 cursor-pointer rounded-[14px] border border-carbon font-aeonik text-xs font-bold transition-all",
                      "focus-visible:ring-2 focus-visible:ring-carbon focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
                      isSelected ? "bg-carbon text-paper-white" : "bg-paper-white text-carbon hover:bg-soft-mist"
                    )}
                  >
                    {GENDER_LABELS[option]}
                  </button>
                );
              })}
            </div>
          </div>

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
            <label className="text-xs font-bold tracking-[0.032em] uppercase text-carbon/80">
              Password (Min. 6 characters)
            </label>
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

          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs font-bold tracking-[0.032em] uppercase text-carbon/80">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Create Free Account</span>
                <ArrowRight className="size-4" />
              </>
            )}
          </motion.button>
        </form>

        {/* Footer Link to Login */}
        <div className="mt-8 pt-5 border-t border-carbon/20 text-center text-xs font-medium text-carbon/75">
          Already have an account?{" "}
          <Link
            href={`/login${nextPath !== "/" ? `?next=${encodeURIComponent(nextPath)}` : ""}`}
            className="font-bold text-carbon underline decoration-carbon underline-offset-4 hover:opacity-80"
          >
            Sign in
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen w-full bg-sky-wash" />}>
      <RegisterContent />
    </Suspense>
  );
}
