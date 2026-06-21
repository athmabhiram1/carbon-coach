"use client";

import { useCallback, useState, createRef } from "react";
import { getPersonaIconComponent } from "@/lib/personas";
import type { Persona } from "@/lib/personas";
import type { FootprintResult } from "@/lib/carbonCalculator";
import type { EcoScore } from "@/lib/ecoScore";

interface ImpactCardProps {
  persona: Persona;
  result: FootprintResult;
  ecoScore: EcoScore;
  rank?: number;
  totalUsers?: number;
}

interface CardStyle {
  bgGradient: string;
  borderClass: string;
  badgeClass: string;
  glowClass: string;
}

const SEVERITY_STYLES: Record<string, CardStyle> = {
  excellent: {
    bgGradient: "from-primary/20 via-surface-container-high/90 to-surface-container-high/90",
    borderClass: "border-primary/30",
    badgeClass: "bg-primary/20 text-primary border-primary/30",
    glowClass: "bg-primary/10",
  },
  good: {
    bgGradient: "from-primary/10 via-surface-container-high/90 to-surface-container-high/90",
    borderClass: "border-primary/25",
    badgeClass: "bg-primary/10 text-primary/90 border-primary/25",
    glowClass: "bg-primary/5",
  },
  average: {
    bgGradient: "from-secondary-container/25 via-surface-container-high/90 to-surface-container-high/90",
    borderClass: "border-secondary-container/30",
    badgeClass: "bg-secondary-container/20 text-on-secondary-container border-secondary-container/30",
    glowClass: "bg-secondary-container/10",
  },
  high: {
    bgGradient: "from-error-container/25 via-surface-container-high/90 to-surface-container-high/90",
    borderClass: "border-error-container/30",
    badgeClass: "bg-error-container/25 text-error border-error-container/30",
    glowClass: "bg-error-container/15",
  },
  critical: {
    bgGradient: "from-error-container/35 via-surface-container-high/90 to-surface-container-high/90",
    borderClass: "border-error-container/40",
    badgeClass: "bg-error-container/30 text-error border-error-container/45",
    glowClass: "bg-error-container/20",
  },
};

export default function ImpactCard({
  persona,
  result,
  ecoScore,
  rank,
  totalUsers,
}: ImpactCardProps) {
  const [copied, setCopied] = useState(false);
  const [downloadError, setDownloadError] = useState(false);
  const cardRef = createRef<HTMLDivElement>();

  const totalTonnes = (result.totalKgCO2PerYear / 1000).toFixed(1);
  
  const style = SEVERITY_STYLES[result.severity] ?? {
    bgGradient: "from-surface-container-high/80 via-surface-container-high/90 to-surface-container-high/90",
    borderClass: "border-outline-variant/30",
    badgeClass: "bg-surface-container-highest border-outline-variant/30 text-on-surface-variant",
    glowClass: "bg-transparent",
  };

  const handleDownload = useCallback(async () => {
    try {
      const html2canvas = (await import("html2canvas")).default;
      if (!cardRef.current) return;

      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: "#0e150e",
      });
      const link = document.createElement("a");
      link.download = "carbon-coach-impact-card.png";
      link.href = canvas.toDataURL();
      link.click();
    } catch {
      setDownloadError(true);
      setTimeout(() => setDownloadError(false), 3000);
    }
  }, [cardRef]);

  const handleShare = useCallback(async () => {
    const text = [
      `Carbon Coach Impact Card`,
      `My footprint: ${totalTonnes} tonnes CO2/year`,
      `EcoScore: ${ecoScore.score} (${ecoScore.title})`,
      rank !== undefined ? `Rank: #${rank} of ${totalUsers ?? "?"} users` : null,
      `Calculate yours at Carbon Coach!`,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [totalTonnes, ecoScore, rank, totalUsers]);

  const PersonaIcon = getPersonaIconComponent(persona.icon);

  return (
    <div className="flex flex-col gap-6 font-body-base">
      <p className="text-sm text-on-surface-variant leading-relaxed">
        Export your carbon profile to share with others and advocate footprint reduction.
      </p>

      <div
        ref={cardRef}
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${style.bgGradient} p-8 text-on-surface border ${style.borderClass} shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col justify-between gap-6`}
        style={{ minHeight: "220px" }}
        aria-label="Impact card preview"
      >
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
        <div className={`absolute -left-12 -top-12 w-32 h-32 rounded-full blur-3xl ${style.glowClass} pointer-events-none`} />
        
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-surface-container-highest/80 border border-outline-variant/30 flex items-center justify-center text-primary">
              <PersonaIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="font-data-metric text-2xl font-bold leading-none tracking-tight">{totalTonnes} tonnes CO₂/year</p>
              <p className="text-xs font-semibold text-on-surface-variant mt-1.5 tracking-wide">{persona.name} · {result.severity.toUpperCase()}</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <div className={`rounded-full px-3.5 py-1 text-xs font-semibold border font-label-caps tracking-wider ${style.badgeClass}`}>
            {ecoScore.title} · {ecoScore.score} PTS
          </div>
          {rank !== undefined && (
            <div className={`rounded-full px-3.5 py-1 text-xs font-semibold border font-label-caps tracking-wider ${style.badgeClass}`}>
              #{rank} LEADERBOARD
            </div>
          )}
        </div>

        <p className="relative z-10 text-xs text-on-surface-variant/90 border-t border-outline-variant/30 pt-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-primary">trending_down</span>
          <span>Top emission source:</span>
          <strong className="uppercase font-label-caps text-primary-fixed font-bold tracking-wider">{result.topCategory}</strong>
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleDownload}
          className="flex-1 rounded-full bg-primary py-3 text-xs font-bold text-on-primary hover:bg-primary-fixed transition-all tracking-wider font-label-caps"
          aria-label="Download impact card as PNG"
        >
          DOWNLOAD CARD
        </button>
        <button
          onClick={handleShare}
          className="flex-1 rounded-full bg-surface-container-highest border border-outline-variant/50 py-3 text-xs font-semibold text-on-surface hover:bg-surface-bright/85 transition-all tracking-wider font-label-caps"
          aria-label="Share impact card"
        >
          {copied ? "COPIED!" : "SHARE SUMMARY"}
        </button>
      </div>

      {downloadError && (
        <p className="text-center text-xs text-error font-medium">
          Could not generate image. Use Share to copy text summary instead.
        </p>
      )}
    </div>
  );
}
