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
    <div className="glass-card rounded-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col justify-between min-h-[360px] fade-in-rise">
      <div>
        <span className="bg-surface-container-highest font-label-caps text-label-caps px-3 py-1 rounded-full text-on-surface-variant text-[10px] uppercase tracking-wider">
          EMISSION SOURCES
        </span>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row items-center gap-6">
        {/* Interactive Pie Chart */}
        <div className="w-40 h-40 relative flex items-center justify-center shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={65}
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
            <span className="font-data-metric text-lg font-bold text-on-surface">
              {(total / 1000).toFixed(1)}t
            </span>
            <span className="font-label-caps text-[9px] text-on-surface-variant">TOTAL</span>
          </div>
        </div>

        {/* Legend Panel */}
        <div className="w-full space-y-3">
          {data.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-on-surface text-sm font-medium">{item.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-data-metric text-xs text-on-surface-variant/80">
                  {item.value.toLocaleString()} kg
                </span>
                <span className="font-data-metric text-sm text-on-surface font-semibold w-8 text-right">
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
