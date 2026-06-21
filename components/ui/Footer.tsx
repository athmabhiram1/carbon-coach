import * as React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full py-12 bg-surface-container-lowest border-t border-outline-variant relative z-10 font-body-base">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col gap-2">
          <div className="font-headline-md text-lg font-bold text-primary flex items-center gap-2">
            <span className="material-symbols-outlined">eco</span> Carbon Coach
          </div>
          <p className="text-xs text-on-surface-variant">© 2026 Carbon Coach. Stewardship for the next generation.</p>
        </div>
        <div className="flex flex-wrap gap-6 text-sm text-on-surface-variant font-medium">
          <Link className="hover:text-primary transition-colors" href="/dashboard">Dashboard</Link>
          <Link className="hover:text-primary transition-colors" href="/leaderboard">Leaderboard</Link>
          <Link className="hover:text-primary transition-colors" href="/how-it-works">How It Works</Link>
        </div>
      </div>
    </footer>
  );
}
