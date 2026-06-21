import React from "react";
import type { SortKey } from "@/types/leaderboard";

interface SortControlsProps {
  sortKey: SortKey;
  onSortChange: (key: SortKey) => void;
}

const SORT_LABELS: Record<SortKey, string> = {
  eco_score: "EcoScore",
  total_kg_co2_per_year: "Total CO2",
  created_at: "Date",
};

export function SortControls({ sortKey, onSortChange }: SortControlsProps) {
  return (
    <section className="flex flex-col md:flex-row justify-between items-center gap-4 fade-in-rise delay-100 mt-4">
      <div className="flex items-center gap-2 bg-surface-container-high/40 backdrop-blur-xl p-1.5 rounded-full border border-white/5">
        <span className="px-6 py-2 text-primary font-body-base text-xs font-bold font-label-caps tracking-wider">
          GLOBAL STANDING
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs text-on-surface-variant font-label-caps tracking-wider uppercase font-semibold">Sort:</span>
        <div className="flex gap-2">
          {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
            <button
              key={key}
              onClick={() => onSortChange(key)}
              className={`rounded-full px-4 py-2 text-xs font-semibold font-label-caps tracking-wider transition-all border ${
                sortKey === key
                  ? "bg-primary border-primary text-on-primary"
                  : "bg-surface-container-high/40 border-white/5 text-on-surface-variant hover:text-on-surface"
              }`}
              aria-pressed={sortKey === key}
            >
              {SORT_LABELS[key].toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
