import React from "react";
import { Leaf, Apple, Utensils, Flame } from "lucide-react";
import { Slider } from "../ui/Slider";
import { UserInputs } from "@/lib/carbon";

interface PreciseSlidersProps {
  inputs: UserInputs;
  onSliderChange: (key: keyof UserInputs, value: number) => void;
  onDietSelect: (diet: UserInputs["dietType"]) => void;
}

const SLIDER_CONFIGS = [
  { key: "kmDrivenPerWeek", label: "Car (km/week)", min: 0, max: 1000, step: 10 },
  { key: "publicTransportKmPerWeek", label: "Public Transport (km/week)", min: 0, max: 500, step: 5 },
  { key: "flightsPerYear", label: "Flights (per year)", min: 0, max: 50, step: 1 },
  { key: "electricityKwhPerMonth", label: "Electricity (kWh/month)", min: 0, max: 2000, step: 50 },
  { key: "onlineOrdersPerMonth", label: "Online Orders (per month)", min: 0, max: 50, step: 1 },
  { key: "naturalGasThermsPerMonth", label: "Natural Gas (therms/month)", min: 0, max: 100, step: 5 },
] as const;

const DIET_OPTIONS = [
  { value: "vegan" as const, label: "Vegan", icon: Leaf },
  { value: "vegetarian" as const, label: "Vegetarian", icon: Apple },
  { value: "omnivore" as const, label: "Omnivore", icon: Utensils },
  { value: "heavy-meat" as const, label: "Heavy Meat", icon: Flame },
];

export function PreciseSliders({ inputs, onSliderChange, onDietSelect }: PreciseSlidersProps) {
  return (
    <div className="relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl blur-xl opacity-40" />
      <div className="relative bg-surface-container-low/80 backdrop-blur-2xl border border-outline-variant/50 rounded-2xl p-6 md:p-8 inner-highlight shadow-[0_20px_50px_rgba(0,0,0,0.3)] space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SLIDER_CONFIGS.map((config) => (
            <Slider
              key={config.key}
              id={config.key}
              min={config.min}
              max={config.max}
              step={config.step}
              value={inputs[config.key as keyof UserInputs] as number}
              onChange={(val) => onSliderChange(config.key as keyof UserInputs, val)}
              label={config.label}
            />
          ))}
        </div>

        <div className="pt-4 border-t border-outline-variant/30">
          <p className="mb-4 text-xs font-semibold text-on-surface-variant font-label-caps tracking-wider uppercase">Diet Type</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {DIET_OPTIONS.map((option) => {
              const isDietSelected = inputs.dietType === option.value;
              const IconComponent = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => onDietSelect(option.value)}
                  className={`flex flex-col items-center rounded-xl border p-4 transition-all duration-300 ${
                    isDietSelected
                      ? "border-primary bg-primary-container/20 shadow-[0_0_15px_rgba(75,226,119,0.15)]"
                      : "border-outline-variant/50 bg-surface-container/40 hover:border-outline hover:bg-surface-container-high/40"
                  }`}
                  aria-label={`Select ${option.label} diet`}
                >
                  <IconComponent className={`w-6 h-6 mb-2 ${isDietSelected ? "text-primary" : "text-on-surface-variant"}`} />
                  <span className="text-xs font-semibold text-on-surface font-label-caps uppercase tracking-wider">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
