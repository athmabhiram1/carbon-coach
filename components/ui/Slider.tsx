"use client";

import * as React from "react";

interface SliderProps {
  id?: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  label?: string;
}

export function Slider({ id, min, max, step = 1, value, onChange, label }: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="w-full flex flex-col gap-2 font-body-base">
      {label && (
        <div className="flex justify-between items-center text-xs font-semibold text-on-surface-variant">
          <span>{label}</span>
          <span className="font-data-metric text-primary font-bold text-sm">{value}</span>
        </div>
      )}
      <div className="relative w-full h-4 flex items-center group">
        {/* Custom Track background */}
        <div className="absolute left-0 right-0 h-1.5 rounded-full bg-surface-container-highest pointer-events-none" />
        {/* Progress fill */}
        <div
          className="absolute left-0 h-1.5 rounded-full bg-primary pointer-events-none transition-all duration-100"
          style={{ width: `${percentage}%` }}
        />
        {/* Native range input hidden under custom thumb */}
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute w-full h-4 opacity-0 cursor-pointer z-10"
        />
        {/* Custom Thumb */}
        <div
          className="absolute w-4 h-4 rounded-full bg-on-surface border-2 border-primary shadow-[0_0_10px_rgba(75,226,119,0.5)] pointer-events-none transition-all duration-100 group-hover:scale-110"
          style={{ left: `calc(${percentage}% - 8px)` }}
        />
      </div>
    </div>
  );
}
