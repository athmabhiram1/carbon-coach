import * as React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function GlassCard({ children, className, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass-card rounded-2xl rounded-tl-[2.5rem] rounded-br-[2.5rem] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-outline-variant/30 relative overflow-hidden transition-all duration-300 hover:shadow-[0_25px_60px_rgba(75,226,119,0.15)] hover:border-primary/20",
        className
      )}
      {...props}
    >
      {/* Top inner-highlight border */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
      {children}
    </div>
  );
}
