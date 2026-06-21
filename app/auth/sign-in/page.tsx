"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message || "Invalid email or password");
        return;
      }

      router.push(redirect);
      router.refresh();
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl bg-surface-container-high/40 backdrop-blur-xl border border-white/10 p-8 shadow-2xl">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-primary text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
            <span className="font-headline-md text-[24px] font-bold text-on-surface">Carbon Coach</span>
          </Link>
          <h1 className="font-display-lg-mobile text-[28px] text-on-surface">Welcome Back</h1>
          <p className="text-on-surface-variant text-sm mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="font-label-caps text-label-caps text-on-surface-variant tracking-wider">
              EMAIL
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="font-label-caps text-label-caps text-on-surface-variant tracking-wider">
              PASSWORD
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-error-container/20 border border-error/30 text-error text-xs text-center">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-full bg-primary text-on-primary text-sm font-bold hover:bg-primary-fixed transition-all disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <span className="text-sm text-on-surface-variant">Don&apos;t have an account? </span>
          <Link href="/auth/sign-up" className="text-sm text-primary font-semibold hover:underline">
            Create one
          </Link>
        </div>

        <div className="mt-4 text-center">
          <Link href="/" className="text-xs text-on-surface-variant hover:text-primary transition-colors">
            &larr; Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Suspense fallback={
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      }>
        <SignInForm />
      </Suspense>
    </div>
  );
}
