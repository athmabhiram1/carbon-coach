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

  const { user } = useAuth();
  const [hasFootprint, setHasFootprint] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem("carbon-coach-data");
    if (data) setHasFootprint(true);
  }, []);

  const hasSession = !!user || hasFootprint;

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
      <HeroAnimationBackground />

      <div className="absolute inset-0 z-[1] bg-background/60 backdrop-blur-[2px] pointer-events-none" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-background via-background/40 to-transparent pointer-events-none" />

      <main className="flex-grow flex flex-col justify-center items-center px-margin-mobile md:px-margin-desktop py-section-gap relative z-10 mt-20">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-8 fade-in-rise">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-highest/80 backdrop-blur-md inner-highlight border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
            <span className="material-symbols-outlined text-[16px] text-primary">public</span>
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">
              Used by 300+ people tracking their impact
            </span>
          </div>

          <h1 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-on-surface max-w-3xl fade-in-rise delay-100">
            What&apos;s your real <span className="font-editorial-italic text-editorial-italic text-primary-fixed">footprint</span>?
          </h1>

          <div className="mt-4 mb-4 fade-in-rise delay-200 flex flex-col items-center">
            <div className="font-data-metric text-[48px] md:text-[72px] font-bold text-white tracking-tighter tabular-nums drop-shadow-[0_0_15px_rgba(75,226,119,0.3)] flex items-baseline gap-2">
              <motion.span>{rounded}</motion.span>
              <span className="text-[24px] md:text-[32px] text-on-surface-variant font-body-base font-normal">kg CO₂/year</span>
            </div>
            <p className="mt-2 text-sm text-on-surface-variant/80 max-w-md">
              The average American produces <span className="font-semibold text-primary">16,000 kg</span> of carbon emissions annually.
            </p>
          </div>

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

          <div className="w-full max-w-md mt-4 flex flex-col gap-4 fade-in-rise delay-300 z-20">
            <div className="flex items-center justify-center gap-4 text-xs text-on-surface-variant font-semibold uppercase tracking-widest">
              <span className="h-px bg-white/10 flex-grow" />
              <span>{hasSession ? "Returning Steward" : "Already have an account?"}</span>
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
                <Link
                  href="/auth/sign-in"
                  className="flex-1 py-3.5 px-6 rounded-full bg-surface-container-high/60 hover:bg-surface-container-highest/90 border border-white/10 text-xs font-bold text-on-surface flex items-center justify-center gap-3 transition-all scale-95 hover:scale-100 active:scale-95"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/sign-up"
                  className="flex-1 py-3.5 px-6 rounded-full bg-primary text-on-primary text-xs font-bold flex items-center justify-center gap-3 hover:bg-primary-fixed transition-all scale-95 hover:scale-100 active:scale-95"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>

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
