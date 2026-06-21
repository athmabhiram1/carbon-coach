import * as React from "react";
import { cn } from "@/lib/utils";
import { GlassCard } from "./GlassCard";

interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string | number;
  unit: string;
  label: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export function MetricCard({ value, unit, label, trend, className, ...props }: MetricCardProps) {
  return (
    <GlassCard className={cn("flex flex-col justify-between min-h-[140px]", className)} {...props}>
      <div>
        <span className="font-label-caps text-label-caps text-on-surface-variant text-[10px] uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="font-data-metric text-[36px] font-bold text-on-surface tracking-tighter leading-none">
          {value}
        </span>
        <span className="font-label-caps text-xs text-on-surface-variant">
          {unit}
        </span>
      </div>
      {trend && (
        <div className="mt-2 flex items-center gap-1.5">
          <span className={cn("text-xs font-bold font-label-caps", trend.isPositive ? "text-primary" : "text-error")}>
            {trend.value}
          </span>
        </div>
      )}
    </GlassCard>
  );
}
