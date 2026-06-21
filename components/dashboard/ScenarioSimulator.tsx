"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Leaf, Plane, Sun, ShoppingBag, RotateCcw } from "lucide-react";
import { getScenarios, applyScenario } from "@/lib/scenarios";
import type { UserInputs, FootprintResult } from "@/lib/carbonCalculator";
import type { Persona } from "@/lib/personas";

interface ScenarioSimulatorProps {
  inputs: UserInputs;
  persona: Persona;
  result: FootprintResult;
}

const SCENARIO_ICONS: Record<string, React.ComponentType<any>> = {
  "switch-to-ev": Zap,
  "go-vegan": Leaf,
  "less-flying": Plane,
  "renewable-energy": Sun,
  "buy-local": ShoppingBag,
};

export default function ScenarioSimulator({
  inputs,
  persona,
  result,
}: ScenarioSimulatorProps) {
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [scenarioResult, setScenarioResult] = useState<FootprintResult | null>(null);

  const scenarios = getScenarios(inputs, persona);

  const handleApply = (scenarioId: string) => {
    if (activeScenario === scenarioId) {
      setActiveScenario(null);
      setScenarioResult(null);
      return;
    }
    setActiveScenario(scenarioId);
    const modified = applyScenario(inputs, scenarioId, persona);
    setScenarioResult(modified);
  };

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-on-surface-variant leading-relaxed">
        Select a scenario to evaluate alternative carbon reductions.
      </p>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {scenarios.map((scenario) => {
          const isSelected = activeScenario === scenario.id;
          const IconComponent = SCENARIO_ICONS[scenario.id] || Zap;

          return (
            <button
              key={scenario.id}
              onClick={() => handleApply(scenario.id)}
              className={`flex flex-col justify-between rounded-xl border p-4 text-left transition-all duration-300 min-h-[140px] ${
                isSelected
                  ? "border-primary bg-primary-container/20 shadow-[0_0_15px_rgba(75,226,119,0.15)]"
                  : "border-outline-variant/50 bg-surface-container/30 hover:border-outline/50"
              }`}
              aria-label={`Apply scenario: ${scenario.label}`}
            >
              <div className="flex flex-col gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isSelected ? "bg-primary text-on-primary" : "bg-surface-container-highest text-on-surface-variant"
                }`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-on-surface leading-tight">{scenario.label}</h4>
                <p className="text-[11px] text-on-surface-variant leading-normal line-clamp-3">{scenario.description}</p>
              </div>
              {scenario.estimatedSavingsKg > 0 && (
                <span className="mt-2 self-start font-data-metric text-[10px] font-semibold text-primary bg-primary-container/10 px-2 py-0.5 rounded-full">
                  -{scenario.estimatedSavingsKg.toLocaleString()} kg/yr
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Comparisons */}
      <AnimatePresence>
        {activeScenario && scenarioResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl bg-surface-container-high/40 border border-outline-variant/30 p-5 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-on-surface">Projection Impact</h4>
                <button
                  onClick={() => {
                    setActiveScenario(null);
                    setScenarioResult(null);
                  }}
                  className="flex items-center gap-1 text-xs text-on-surface-variant hover:text-primary transition-colors font-semibold"
                  aria-label="Reset scenario"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
              </div>

              <div className="space-y-4">
                {(["transport", "diet", "energy", "shopping"] as const).map(
                  (category) => {
                    const before = result.breakdown[category];
                    const after = scenarioResult.breakdown[category];
                    const maxVal = Math.max(before, after, 1);
                    return (
                      <div key={category} className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="capitalize text-on-surface-variant">{category}</span>
                          <span className="font-data-metric text-on-surface">
                            {before.toLocaleString()} → {after.toLocaleString()} kg
                          </span>
                        </div>
                        <div className="flex h-3.5 gap-1.5 bg-surface-container-lowest rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-outline/60"
                            initial={{ width: 0 }}
                            animate={{ width: `${(before / maxVal) * 100}%` }}
                            transition={{ duration: 0.5 }}
                          />
                          <motion.div
                            className="h-full rounded-full bg-primary"
                            initial={{ width: 0 }}
                            animate={{ width: `${(after / maxVal) * 100}%` }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>

              <div className="rounded-xl bg-primary-container/20 border border-primary/30 p-4 text-center mt-2">
                <p className="text-sm font-semibold text-primary">
                  Net Savings:{" "}
                  <span className="font-data-metric font-bold text-base ml-1">
                    -{(result.totalKgCO2PerYear - scenarioResult.totalKgCO2PerYear).toLocaleString()}
                  </span>{" "}
                  kg CO₂/year
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
