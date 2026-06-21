"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Users, CheckCircle, Brain, ArrowRight } from "lucide-react";
import { useReducedMotion } from "@/lib/useReducedMotion";
import HeroAnimationBackground from "./HeroAnimationBackground";
import { useAuth } from "@/lib/hooks/useAuth";
import Link from "next/link";

interface HeroCounterProps {
  onComplete: () => void;
}

export default function HeroCounter({ onComplete }: HeroCounterProps) {
  const count = useMotionValue(16000);
  const rounded = useTransform(count, (v) => Math.round(v).toLocaleString());
  const reduced = useReducedMotion();

  const { user, anonymousId, signInWithOAuth } = useAuth();
  const [hasFootprint, setHasFootprint] = useState(false);
  const [loginLoading, setLoginLoading] = useState<string | null>(null);

  useEffect(() => {
    const data = localStorage.getItem("carbon-coach-data");
    if (data) {
      setHasFootprint(true);
    }
  }, []);

  const handleSignIn = async (provider: "google" | "github") => {
    try {
      setLoginLoading(provider);
      await signInWithOAuth(provider);
    } catch (err) {
      console.error("Sign-in failed:", err);
      setLoginLoading(null);
    }
  };

  const hasSession = !!user || (!!anonymousId && hasFootprint);

  useEffect(() => {
    if (reduced) {
      count.set(0);
      return;
    }

    const controls = animate(count, 0, {
      duration: 3.5,
      ease: "easeInOut",
    });
    return controls.stop;
  }, [count, reduced]);

  return (
    <section className="relative flex min-h-screen flex-col justify-between overflow-hidden">
      {/* Cinematic Looping Animation Background */}
      <HeroAnimationBackground />

      {/* Overlays to ensure legibility */}
      <div className="absolute inset-0 z-[1] bg-background/60 backdrop-blur-[2px] pointer-events-none" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-background via-background/40 to-transparent pointer-events-none" />

      {/* Main Hero Content Canvas */}
      <main className="flex-grow flex flex-col justify-center items-center px-margin-mobile md:px-margin-desktop py-section-gap relative z-10 mt-20">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-8 fade-in-rise">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-highest/80 backdrop-blur-md inner-highlight border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
            <span className="material-symbols-outlined text-[16px] text-primary">public</span>
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">
              Used by 300+ people tracking their impact
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-on-surface max-w-3xl fade-in-rise delay-100">
            What&apos;s your real <span className="font-editorial-italic text-editorial-italic text-primary-fixed">footprint</span>?
          </h1>

          {/* Animated Counter */}
          <div className="mt-4 mb-4 fade-in-rise delay-200 flex flex-col items-center">
            <div className="font-data-metric text-[48px] md:text-[72px] font-bold text-white tracking-tighter tabular-nums drop-shadow-[0_0_15px_rgba(75,226,119,0.3)] flex items-baseline gap-2">
              <motion.span>{rounded}</motion.span>
              <span className="text-[24px] md:text-[32px] text-on-surface-variant font-body-base font-normal">kg CO₂/year</span>
            </div>
            <p className="mt-2 text-sm text-on-surface-variant/80 max-w-md">
              The average American produces <span className="font-semibold text-primary">16,000 kg</span> of carbon emissions annually.
            </p>
          </div>

          {/* Primary CTA Pill Bar */}
          <div className="w-full max-w-md relative fade-in-rise delay-300">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-inverse-primary rounded-full blur opacity-30 group-hover:opacity-100 transition duration-1000" />
            <button
              onClick={onComplete}
              className="relative w-full bg-surface-container-highest/90 backdrop-blur-xl border border-white/10 inner-highlight text-on-surface px-8 py-5 rounded-full flex items-center justify-between group hover:bg-surface-bright/90 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
              aria-label="Calculate My Footprint"
            >
              <span className="font-body-base text-[18px] font-medium pl-4 text-left">Calculate My Footprint</span>
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary group-hover:bg-primary-fixed transition-colors">
                <ArrowRight className="w-5 h-5 text-on-primary" />
              </div>
            </button>
          </div>

          {/* Login Options / Go to Dashboard */}
          <div className="w-full max-w-md mt-4 flex flex-col gap-4 fade-in-rise delay-300 z-20">
            <div className="flex items-center justify-center gap-4 text-xs text-on-surface-variant font-semibold uppercase tracking-widest">
              <span className="h-px bg-white/10 flex-grow" />
              <span>{hasSession ? "Returning Steward" : "Or Sign In"}</span>
              <span className="h-px bg-white/10 flex-grow" />
            </div>

            {hasSession ? (
              <Link
                href="/dashboard"
                className="w-full py-4 rounded-full bg-primary text-on-primary text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary-fixed transition-all shadow-lg hover:shadow-primary/20 scale-95 hover:scale-100 active:scale-95"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4 text-on-primary" />
              </Link>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleSignIn("google")}
                  disabled={loginLoading !== null}
                  className="flex-1 py-3.5 px-6 rounded-full bg-surface-container-high/60 hover:bg-surface-container-highest/90 border border-white/10 text-xs font-bold text-on-surface flex items-center justify-center gap-3 transition-all scale-95 hover:scale-100 active:scale-95 disabled:opacity-50"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                  </svg>
                  {loginLoading === "google" ? "Connecting..." : "Google Sign In"}
                </button>
                <button
                  onClick={() => handleSignIn("github")}
                  disabled={loginLoading !== null}
                  className="flex-1 py-3.5 px-6 rounded-full bg-surface-container-high/60 hover:bg-surface-container-highest/90 border border-white/10 text-xs font-bold text-on-surface flex items-center justify-center gap-3 transition-all scale-95 hover:scale-100 active:scale-95 disabled:opacity-50"
                >
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                  </svg>
                  {loginLoading === "github" ? "Connecting..." : "GitHub Sign In"}
                </button>
              </div>
            )}
          </div>

          {/* Trust Bar Chips */}
          <div className="flex flex-wrap justify-center gap-4 mt-8 fade-in-rise delay-300">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-low/50 backdrop-blur-md border border-white/5">
              <Users className="w-4 h-4 text-secondary" />
              <span className="font-body-base text-sm text-on-surface-variant">5 personas</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-low/50 backdrop-blur-md border border-white/5">
              <CheckCircle className="w-4 h-4 text-secondary" />
              <span className="font-body-base text-sm text-on-surface-variant">10 actions tracked</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-low/50 backdrop-blur-md border border-white/5">
              <Brain className="w-4 h-4 text-secondary" />
              <span className="font-body-base text-sm text-on-surface-variant">Real-time AI coaching</span>
            </div>
          </div>
        </div>
      </main>
    </section>
  );
}
