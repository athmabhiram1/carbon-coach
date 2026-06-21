import * as React from "react";
import { cn } from "@/lib/utils";

interface EyebrowBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  icon?: string;
}

export function EyebrowBadge({ children, icon, className, ...props }: EyebrowBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-highest/80 backdrop-blur-md inner-highlight border border-white/5 shadow-md text-on-surface-variant font-label-caps text-[10px] uppercase tracking-widest font-semibold",
        className
      )}
      {...props}
    >
      {icon && <span className="material-symbols-outlined text-[14px] text-primary">{icon}</span>}
      {children}
    </span>
  );
}
