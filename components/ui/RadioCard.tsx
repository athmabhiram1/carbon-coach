"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface RadioCardOption {
  value: string;
  label: string;
  description?: string;
  icon?: string;
}

interface RadioCardProps {
  options: RadioCardOption[];
  selectedValue: string;
  onChange: (value: string) => void;
  className?: string;
}

export function RadioCard({ options, selectedValue, onChange, className }: RadioCardProps) {
  return (
    <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {options.map((opt) => {
        const isSelected = selectedValue === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative flex flex-col items-center justify-center rounded-xl p-4 text-center transition-all duration-300 min-h-[120px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border bg-surface-container-low/40 backdrop-blur-xl",
              isSelected
                ? "bg-primary-container/20 border-primary shadow-[0_0_15px_rgba(75,226,119,0.15)]"
                : "border-white/10 hover:border-white/20 hover:bg-surface-container-high/40"
            )}
          >
            {opt.icon && <span className="text-2xl mb-1">{opt.icon}</span>}
            <h4 className="font-headline-md text-sm font-bold text-on-surface">{opt.label}</h4>
            {opt.description && <p className="mt-1 text-[11px] text-on-surface-variant leading-relaxed">{opt.description}</p>}
          </button>
        );
      })}
    </div>
  );
}
