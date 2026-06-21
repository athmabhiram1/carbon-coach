"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { getAllProjections, Action } from "@/lib/timeMachine";
import type { FootprintResult } from "@/lib/carbonCalculator";

interface CarbonTimeMachineProps {
  result: FootprintResult;
  actions: Action[];
  checkedActions: string[];
}

type DisplayUnit = "tonnes" | "trees" | "miles";

export default function CarbonTimeMachine({
  result,
  actions,
  checkedActions,
}: CarbonTimeMachineProps) {
  const [displayUnit, setDisplayUnit] = useState<DisplayUnit>("tonnes");

  const activeActions = actions.filter((a) => checkedActions.includes(a.id));
  const projections = useMemo(
    () => getAllProjections(result, activeActions),
    [result, activeActions]
  );

  const maxValue = Math.max(
    ...projections.map((p) => p.projectedTotal),
    1
  );

  const getDisplayValue = (kg: number): { value: number; label: string } => {
    switch (displayUnit) {
      case "tonnes":
        return { value: kg / 1000, label: "t" };
      case "trees":
        return { value: kg / 22, label: "trees" };
      case "miles":
        return { value: kg / 0.404, label: "miles" };
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-on-surface-variant leading-relaxed">
        See how carbon impact accumulates over time, and the long-term difference of active choices.
      </p>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-surface-container-lowest/50 backdrop-blur-md rounded-full w-fit border border-outline-variant/30 inner-highlight mx-auto">
        {(["tonnes", "trees", "miles"] as DisplayUnit[]).map((unit) => (
          <button
            key={unit}
            onClick={() => setDisplayUnit(unit)}
            className={`px-4 py-1.5 rounded-full font-body-base text-xs font-semibold transition-all duration-300 ${
              displayUnit === unit
                ? "bg-surface-container-highest text-on-surface border border-outline-variant/50 shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
            aria-label={`Show in ${unit}`}
          >
            Show in {unit}
          </button>
        ))}
      </div>

      {/* Projection Bars */}
      <div className="flex items-end justify-center gap-8 py-4">
        {projections.map((proj, i) => {
          const currentDisplay = getDisplayValue(proj.projectedTotal);
          const actionDisplay = getDisplayValue(proj.projectedWithActions);
          const maxDisplay = getDisplayValue(maxValue);

          const currentHeight =
            maxDisplay.value > 0
              ? (currentDisplay.value / maxDisplay.value) * 160
              : 0;
          const actionHeight =
            maxDisplay.value > 0
              ? (actionDisplay.value / maxDisplay.value) * 160
              : 0;

          return (
            <div key={proj.years} className="flex flex-col items-center">
              <span className="mb-3 font-label-caps text-xs text-on-surface-variant font-bold">
                {proj.years} {proj.years === 1 ? "Year" : "Years"}
              </span>

              <div className="relative flex items-end gap-3" style={{ height: 180 }}>
                {/* Current path bar */}
                <div className="flex flex-col items-center">
                  <motion.div
                    className="w-10 rounded-t-lg bg-outline/40"
                    initial={{ height: 0 }}
                    animate={{ height: Math.max(currentHeight, 4) }}
                    transition={{ duration: 0.8, delay: i * 0.15 }}
                    style={{ minHeight: 4 }}
                    aria-label={`Current path: ${currentDisplay.value.toFixed(0)} ${currentDisplay.label}`}
                  />
                  <span className="mt-1.5 text-[9px] font-label-caps uppercase tracking-wider text-on-surface-variant">Baseline</span>
                </div>

                {/* Actions path bar */}
                <div className="flex flex-col items-center">
                  <motion.div
                    className="w-10 rounded-t-lg bg-primary"
                    initial={{ height: 0 }}
                    animate={{ height: Math.max(actionHeight, 4) }}
                    transition={{ duration: 0.8, delay: i * 0.15 + 0.3 }}
                    style={{ minHeight: 4 }}
                    aria-label={`Action path: ${actionDisplay.value.toFixed(0)} ${actionDisplay.label}`}
                  />
                  <span className="mt-1.5 text-[9px] font-label-caps uppercase tracking-wider text-primary">Reduced</span>
                </div>
              </div>

              {/* Projections Values */}
              <div className="mt-4 text-center space-y-0.5">
                <p className="font-data-metric text-xs text-on-surface-variant">
                  {currentDisplay.value.toFixed(0)}
                  <span className="text-[10px] font-body-base font-normal"> {currentDisplay.label}</span>
                </p>
                <p className="font-data-metric text-xs text-primary font-bold">
                  {actionDisplay.value.toFixed(0)}
                  <span className="text-[10px] font-body-base font-normal"> {actionDisplay.label}</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {activeActions.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl bg-primary-container/20 border border-primary/30 p-4 text-center text-sm text-primary"
        >
          <p>
            10-Year Cumulative Savings:{" "}
            <span className="font-data-metric font-bold text-base">
              -{projections[2].savingsPotential.toLocaleString()}
            </span>{" "}
            kg CO₂ — equivalent to planting{" "}
            <span className="font-data-metric font-bold text-base">{projections[2].equivalentTrees}</span> trees or avoiding{" "}
            <span className="font-data-metric font-bold text-base">{projections[2].equivalentMiles.toLocaleString()}</span> car miles.
          </p>
        </motion.div>
      )}
    </div>
  );
}
