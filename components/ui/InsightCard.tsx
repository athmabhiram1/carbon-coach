import * as React from "react";
import { cn } from "@/lib/utils";
import { GlassCard } from "./GlassCard";

interface InsightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  icon?: string;
  badge?: string;
  children: React.ReactNode;
}

export function InsightCard({ title, icon, badge, children, className, ...props }: InsightCardProps) {
  return (
    <GlassCard className={cn("flex flex-col gap-4 border-l-4 border-l-primary", className)} {...props}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon && <span className="material-symbols-outlined text-primary text-xl">{icon}</span>}
          <h4 className="text-sm font-semibold text-on-surface">{title}</h4>
        </div>
        {badge && (
          <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-[10px] font-bold font-label-caps">
            {badge}
          </span>
        )}
      </div>
      <div className="text-sm text-on-surface-variant leading-relaxed">
        {children}
      </div>
    </GlassCard>
  );
}
