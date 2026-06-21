"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { FootprintResult } from "@/lib/carbonCalculator";

interface BreakdownChartProps {
  breakdown: FootprintResult["breakdown"];
}

const COLORS = ["#4be277", "#bcc7de", "#c5c7c9", "#ffb4ab"];
const LABELS = ["Transport", "Diet", "Energy", "Shopping"];

export default function BreakdownChart({ breakdown }: BreakdownChartProps) {
  const total = Object.values(breakdown).reduce((a, b) => a + b, 0);

  const data = LABELS.map((label, idx) => {
    const key = label.toLowerCase() as keyof typeof breakdown;
    const value = Math.round(breakdown[key]);
    const percentage = total > 0 ? ((breakdown[key] / total) * 100).toFixed(0) : "0";
    return {
      name: label === "Energy" ? "Home Energy" : label,
      value,
      percentage,
      color: COLORS[idx],
    };
  });

  return (
    <div className="glass-card rounded-2xl rounded-tl-[2.5rem] rounded-br-[2.5rem] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-outline-variant/30 flex flex-col justify-between min-h-[380px] fade-in-rise transition-all duration-300 hover:shadow-[0_25px_60px_rgba(75,226,119,0.15)] hover:border-primary/20">
      <div>
        <span className="bg-surface-container-highest font-label-caps text-label-caps px-3 py-1 rounded-full text-on-surface-variant text-[10px] uppercase tracking-wider">
          EMISSION SOURCES
        </span>
      </div>

      <div className="mt-4 flex flex-col items-center gap-4">
        {/* Interactive Pie Chart */}
        <div className="w-36 h-36 relative flex items-center justify-center shrink-0">
          {/* Subtle background glow behind the chart */}
          <div className="absolute inset-2 bg-primary/5 blur-xl rounded-full pointer-events-none" />
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={44}
                outerRadius={58}
                paddingAngle={3}
                dataKey="value"
                aria-label="Carbon emission breakdown by category"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a221a",
                  border: "1px solid #3d4a3d",
                  borderRadius: "12px",
                  color: "#dce5d9",
                  fontFamily: "Geist, sans-serif",
                }}
                formatter={(value: number, name: string) => [
                  `${value.toLocaleString()} kg (${data.find((d) => d.name === name)?.percentage}%)`,
                  name,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute flex flex-col items-center justify-center pointer-events-none">
            <span className="font-data-metric text-base font-bold text-on-surface">
              {(total / 1000).toFixed(1)}t
            </span>
            <span className="font-label-caps text-[8px] text-on-surface-variant">TOTAL</span>
          </div>
        </div>

        {/* Legend Panel - Grid of 2 columns to prevent overlap and look premium */}
        <div className="w-full grid grid-cols-2 gap-2 mt-2">
          {data.map((item, idx) => (
            <div 
              key={idx} 
              className="flex flex-col p-2.5 rounded-xl bg-surface-container-high/20 border border-outline-variant/10 transition-all duration-300 hover:bg-surface-container-high/40 hover:border-outline-variant/30"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-on-surface text-[11px] font-semibold tracking-wide whitespace-nowrap overflow-hidden text-ellipsis">
                  {item.name}
                </span>
              </div>
              <div className="flex justify-between items-baseline pl-3.5">
                <span className="font-data-metric text-[10px] text-on-surface-variant/80 whitespace-nowrap">
                  {item.value.toLocaleString()} kg
                </span>
                <span className="font-data-metric text-xs text-primary font-bold whitespace-nowrap ml-1">
                  {item.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
