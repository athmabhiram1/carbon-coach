import React, { useMemo } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Persona } from "@/lib/personas";
import { FootprintResult } from "@/lib/carbon";

interface PreviewSidebarProps {
  result: FootprintResult;
  persona: Persona;
}

export function PreviewSidebar({ result, persona }: PreviewSidebarProps) {
  const animatedValue = useMotionValue(result.totalKgCO2PerYear);
  const animatedDisplay = useTransform(animatedValue, (v) => (v / 1000).toFixed(1));

  useMemo(() => {
    animate(animatedValue, result.totalKgCO2PerYear, {
      duration: 0.5,
      ease: "easeOut",
    });
  }, [result.totalKgCO2PerYear, animatedValue]);

  const personaBaselineTotal = Object.values(persona.baseline).reduce((a, b) => a + b, 0);
  const diffPercent = ((result.totalKgCO2PerYear - personaBaselineTotal) / personaBaselineTotal * 100);
  const comparisonPercentText = diffPercent >= 0 ? `+${diffPercent.toFixed(0)}%` : `${diffPercent.toFixed(0)}%`;
  const isAboveBaseline = diffPercent >= 0;

  return (
    <div className="sticky top-32 bg-surface-container-high/40 backdrop-blur-xl border border-outline-variant/50 rounded-2xl p-8 inner-highlight shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-between mb-8 border-b border-outline-variant/30 pb-4">
        <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider text-[10px]">Live Preview</span>
        <span className="material-symbols-outlined text-primary text-[20px]">eco</span>
      </div>

      <div className="flex flex-col gap-2 mb-8">
        <span className="font-body-base text-body-base text-on-surface-variant">Estimated Annual Impact</span>
        <div className="flex items-baseline gap-2">
          <motion.span className="font-data-metric text-[48px] text-primary tracking-tighter font-bold">
            {animatedDisplay}
          </motion.span>
          <span className="font-label-caps text-label-caps text-on-surface-variant">Tons CO₂e</span>
        </div>
      </div>

      {/* Comparison Context */}
      <div className="space-y-4">
        <div className="flex justify-between font-label-caps text-label-caps">
          <span className="text-on-surface-variant">vs. Persona Average ({(personaBaselineTotal / 1000).toFixed(1)}t)</span>
          <span className={isAboveBaseline ? "text-error" : "text-primary"}>
            {comparisonPercentText}
          </span>
        </div>

        {/* Custom Data Visualization Bar */}
        <div className="relative h-2 w-full bg-surface-container-lowest rounded-full overflow-hidden">
          {/* Average Marker */}
          <div className="absolute top-0 bottom-0 left-[50%] w-0.5 bg-on-surface-variant z-10" />
          {/* Current Score Fill */}
          <div 
            className={`absolute top-0 bottom-0 left-0 rounded-full opacity-80 transition-all duration-500 ${
              isAboveBaseline ? "bg-gradient-to-r from-primary to-error" : "bg-primary"
            }`} 
            style={{ width: `${Math.min(100, Math.max(10, (result.totalKgCO2PerYear / (personaBaselineTotal * 2)) * 100))}%` }}
          />
        </div>

        <p className="font-body-base text-body-base text-sm text-on-surface-variant/70 leading-relaxed mt-4">
          {result.topCategory === "transport" && "Your commuting and travel emissions represent the largest portion of your footprint."}
          {result.topCategory === "energy" && "Your household heating and electricity emissions represent the largest portion of your footprint."}
          {result.topCategory === "diet" && "Your dietary choices represent the largest portion of your footprint."}
          {result.topCategory === "shopping" && "Your online shopping frequency represents the largest portion of your footprint."}
          {" We'll identify specific reduction strategies in your personalized dashboard."}
        </p>
      </div>
    </div>
  );
}
