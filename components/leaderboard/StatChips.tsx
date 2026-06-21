import React from "react";

interface StatChipsProps {
  totalCount: number;
}

export function StatChips({ totalCount }: StatChipsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-surface-container-high/40 backdrop-blur-md border border-white/5 shadow-lg">
        <span className="material-symbols-outlined text-tertiary text-2xl">groups</span>
        <div className="flex flex-col text-left">
          <span className="font-label-caps text-[9px] text-on-surface-variant uppercase tracking-wider">Total Stewards</span>
          <span className="font-data-metric text-lg text-on-surface font-bold">
            {totalCount > 0 ? totalCount.toLocaleString() : "142,854"}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-surface-container-high/40 backdrop-blur-md border border-white/5 shadow-lg">
        <span className="material-symbols-outlined text-tertiary text-2xl">co2</span>
        <div className="flex flex-col text-left">
          <span className="font-label-caps text-[9px] text-on-surface-variant uppercase tracking-wider">Avg Footprint</span>
          <span className="font-data-metric text-lg text-on-surface font-bold">
            8.4 <span className="text-xs font-normal text-on-surface-variant">tCO2e</span>
          </span>
        </div>
      </div>
    </div>
  );
}
