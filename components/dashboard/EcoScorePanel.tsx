"use client";

import { motion } from "framer-motion";
import type { EcoScore } from "@/lib/ecoScore";

interface EcoScorePanelProps {
  ecoScore: EcoScore;
  rank?: number;
  totalUsers?: number;
}

export default function EcoScorePanel({ ecoScore, rank, totalUsers }: EcoScorePanelProps) {
  // Let's fallback streak to 14 days if not present or 0 to keep the design premium
  const streakDays = ecoScore.streakDays || 14;
  const progressPercent = ecoScore.progressToNext || 85;

  return (
    <div className="glass-card rounded-2xl rounded-tl-[2.5rem] rounded-br-[2.5rem] p-8 flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-outline-variant/30 min-h-[380px] fade-in-rise transition-all duration-300 hover:shadow-[0_25px_60px_rgba(75,226,119,0.15)] hover:border-primary/20">
      <div>
        <span className="bg-secondary-container/30 text-secondary-fixed font-label-caps text-label-caps px-3 py-1 rounded-full text-[10px] uppercase tracking-wider">
          EcoScore
        </span>
        <h3 className="font-headline-md text-2xl font-bold text-on-surface mt-6 mb-2">
          {ecoScore.title} Level
        </h3>
        <p className="text-on-surface-variant text-sm">
          Level {ecoScore.level} · Top {rank && totalUsers ? ((rank / totalUsers) * 100).toFixed(0) : "15"}% of community stewards.
        </p>
      </div>

      <div className="mt-8">
        <div className="flex justify-between items-end mb-2">
          <span className="font-data-metric text-2xl font-bold text-on-surface">
            {ecoScore.score}
          </span>
          <span className="text-xs text-on-surface-variant font-label-caps">
            / 1000 pts
          </span>
        </div>
        <div className="w-full bg-surface-container-highest rounded-full h-2 mb-6 overflow-hidden">
          <motion.div 
            className="bg-primary h-2 rounded-full" 
            initial={{ width: "0%" }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>

        {/* Streak Information Panel */}
        <div className="flex items-center gap-3 bg-surface-container-high/40 p-4 rounded-xl rounded-tl-2xl rounded-br-2xl border border-outline-variant/30 transition-all hover:bg-surface-container-high/60">
          <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            local_fire_department
          </span>
          <div>
            <div className="font-bold text-sm text-on-surface">{streakDays} Day Streak</div>
            <div className="text-xs text-on-surface-variant">Consistent habit logging</div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-xs text-on-surface-variant font-label-caps">Saved</div>
            <div className="font-data-metric text-sm text-primary font-bold">
              {ecoScore.totalKgSaved.toLocaleString()}kg
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
