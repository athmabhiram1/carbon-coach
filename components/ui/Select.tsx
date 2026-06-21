"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
  label?: string;
}

export function Select({ options, label, className, id, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5 font-body-base w-full relative">
      {label && <span className="text-xs font-semibold text-on-surface-variant">{label}</span>}
      <div className="relative">
        <select
          id={id}
          className={cn(
            "appearance-none w-full bg-surface-container-highest/50 border border-outline-variant/30 text-on-surface text-sm rounded-full pl-6 pr-10 py-2.5 outline-none focus:border-primary/50 cursor-pointer transition-all duration-200",
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-surface-container-high text-on-surface">
              {opt.label}
            </option>
          ))}
        </select>
        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-lg">
          expand_more
        </span>
      </div>
    </div>
  );
}
