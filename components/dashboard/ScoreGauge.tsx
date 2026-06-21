"use client";

import { motion } from "framer-motion";
import type { FootprintResult } from "@/lib/carbonCalculator";

interface ScoreGaugeProps {
  result: FootprintResult;
  personaName: string;
}

export default function ScoreGauge({ result, personaName }: ScoreGaugeProps) {
  const totalTonnes = (result.totalKgCO2PerYear / 1000).toFixed(1);
  
  // Circumference of r=45 circle is 2 * PI * 45 = 282.74
  const circumference = 282.74;
  const maxFootprint = 16000; // Reference maximum
  const progress = Math.min(result.totalKgCO2PerYear / maxFootprint, 1);
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="glass-card rounded-2xl p-8 flex flex-col items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden min-h-[360px] fade-in-rise">
      {/* Eyebrow badge */}
      <div className="absolute top-6 left-6 flex items-center gap-2">
        <span className="bg-primary-container/20 text-primary font-label-caps text-label-caps px-3 py-1 rounded-full uppercase tracking-wider text-[10px]">
          Current Footprint
        </span>
      </div>

      {/* SVG Circular Gauge */}
      <div className="relative w-56 h-56 mt-8 flex items-center justify-center pulse-once">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100" aria-label={`Carbon footprint gauge showing ${totalTonnes} tonnes`}>
          <circle 
            className="text-surface-container-highest" 
            cx="50" 
            cy="50" 
            fill="none" 
            r="45" 
            stroke="currentColor" 
            strokeWidth="7" 
          />
          <motion.circle
            className="text-primary gauge-ring"
            cx="50"
            cy="50"
            fill="none"
            r="45"
            stroke="currentColor"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-data-metric text-[48px] font-bold text-on-surface leading-none">
            {totalTonnes}
          </span>
          <span className="font-label-caps text-on-surface-variant mt-1 text-[11px]">
            TONS / YR
          </span>
        </div>
      </div>

      {/* Comparative Context Stats */}
      <div className="mt-8 flex gap-4 w-full justify-center">
        <div className="bg-surface-container-high/40 border border-white/5 rounded-xl px-4 py-2.5 flex flex-col items-center flex-1 max-w-[130px]">
          <span className="text-on-surface-variant text-xs">National Avg</span>
          <span className="font-data-metric text-lg text-on-surface font-semibold mt-1">16.0t</span>
        </div>
        <div className="bg-surface-container-high/40 border border-white/5 rounded-xl px-4 py-2.5 flex flex-col items-center flex-1 max-w-[130px]">
          <span className="text-on-surface-variant text-xs">{personaName} Avg</span>
          <span className="font-data-metric text-lg text-on-surface-variant font-semibold mt-1">
            {(result.totalKgCO2PerYear / 1000).toFixed(1)}t
          </span>
        </div>
        <div className="bg-surface-container-high/40 border border-white/5 rounded-xl px-4 py-2.5 flex flex-col items-center flex-1 max-w-[130px]">
          <span className="text-on-surface-variant text-xs">Net Zero Target</span>
          <span className="font-data-metric text-lg text-primary font-semibold mt-1">2.0t</span>
        </div>
      </div>
    </div>
  );
}
