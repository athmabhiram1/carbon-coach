"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Car, Apple, Utensils, Flame, Leaf, Plane, ArrowRight } from "lucide-react";
import { UserInputs, calculateFootprint } from "@/lib/carbonCalculator";
import { Persona } from "@/lib/personas";
import { Slider } from "../ui/Slider";

interface InputFormProps {
  persona: Persona;
  onComplete: (inputs: UserInputs) => void;
}

type Tab = "precise" | "quick";

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

function parseNLP(text: string): Partial<UserInputs> {
  const result: Partial<UserInputs> = {};
  const lower = text.toLowerCase();

  const driveMatch = lower.match(/(?:drive|driving|commute)\s*(?:about|around|approximately|~)?\s*(\d+)\s*(?:km|kms|miles|mi|kilometers?|m)?/i);
  if (driveMatch) {
    const val = parseInt(driveMatch[1], 10);
    const unit = driveMatch[0].toLowerCase();
    result.kmDrivenPerWeek = unit.includes("mile") || unit.includes("mi ") ? Math.round(val * 1.609) : val;
  }

  if (/vegan|plant.based|no (animal|meat|dairy)/i.test(lower)) {
    result.dietType = "vegan";
  } else if (/vegetarian|veg\b|no meat/i.test(lower) && !result.dietType) {
    result.dietType = "vegetarian";
  } else if (/heavy.meat|eat.*meat.*daily|meat.*every.*day/i.test(lower)) {
    result.dietType = "heavy-meat";
  } else if (/omnivore|eat.*meat|meat.*3|meat.*three|meat.*times?.*week/i.test(lower)) {
    result.dietType = "omnivore";
  }

  const flightMatch = lower.match(/(?:fly|flight|flying|travel|trip)\s*(?:about|around|~)?\s*(\d+)\s*(?:times?|x\b)?/i);
  if (flightMatch) {
    result.flightsPerYear = parseInt(flightMatch[1], 10);
  }

  return result;
}

export default function InputForm({ persona, onComplete }: InputFormProps) {
  const [tab, setTab] = useState<Tab>("precise");
  const [inputs, setInputs] = useState<UserInputs>({
    kmDrivenPerWeek: persona.baseline.transport ? Math.round(persona.baseline.transport / 52 * 10) : 100,
    publicTransportKmPerWeek: 0,
    flightsPerYear: persona.id === "frequent-flyer" ? 12 : 2,
    dietType: persona.id === "eco-conscious" ? "vegetarian" : "omnivore",
    electricityKwhPerMonth: 500,
    onlineOrdersPerMonth: 10,
    naturalGasThermsPerMonth: 10,
  });
  const [nlpText, setNlpText] = useState("");
  const [parsedFields, setParsedFields] = useState<{ label: string; icon: any }[]>([]);

  const result = useMemo(
    () => calculateFootprint(inputs, persona),
    [inputs, persona]
  );

  const animatedValue = useMotionValue(result.totalKgCO2PerYear);
  const animatedDisplay = useTransform(animatedValue, (v) => (v / 1000).toFixed(1));

  useMemo(() => {
    animate(animatedValue, result.totalKgCO2PerYear, {
      duration: 0.5,
      ease: "easeOut",
    });
  }, [result.totalKgCO2PerYear, animatedValue]);

  const handleSliderChange = useCallback(
    (key: keyof UserInputs, value: number) => {
      setInputs((prev) => ({ ...prev, [key]: Math.max(0, value) }));
    },
    []
  );

  const handleDietSelect = useCallback((diet: UserInputs["dietType"]) => {
    setInputs((prev) => ({ ...prev, dietType: diet }));
  }, []);

  const handleNLPSubmit = useCallback(() => {
    const parsed = parseNLP(nlpText);
    const detected: { label: string; icon: any }[] = [];
    if (parsed.kmDrivenPerWeek !== undefined) detected.push({ label: "Driving", icon: Car });
    if (parsed.dietType) {
      const icon = DIET_OPTIONS.find((o) => o.value === parsed.dietType)?.icon ?? Leaf;
      detected.push({ label: `${parsed.dietType} diet`, icon });
    }
    if (parsed.flightsPerYear !== undefined) detected.push({ label: `${parsed.flightsPerYear} flights`, icon: Plane });
    
    setParsedFields(detected);
    setInputs((prev) => ({ ...prev, ...parsed }));
  }, [nlpText]);

  const personaBaselineTotal = Object.values(persona.baseline).reduce((a, b) => a + b, 0);
  const diffPercent = ((result.totalKgCO2PerYear - personaBaselineTotal) / personaBaselineTotal * 100);
  const comparisonPercentText = diffPercent >= 0 ? `+${diffPercent.toFixed(0)}%` : `${diffPercent.toFixed(0)}%`;
  const isAboveBaseline = diffPercent >= 0;

  const isValid = inputs.dietType !== null;

  return (
    <section className="w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 relative z-10 font-body-base">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter items-start">
        {/* Left Column: Input Form Area */}
        <div className="md:col-span-7 flex flex-col gap-8 fade-in-rise">
          <header className="flex flex-col gap-2">
            <span className="font-label-caps text-label-caps text-primary uppercase tracking-widest text-[10px]">
              Onboarding · Phase II
            </span>
            <h2 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-on-surface leading-tight">
              Step 2: Describe your <span className="font-editorial-italic text-editorial-italic text-primary block md:inline">lifestyle</span>
            </h2>
          </header>

          {/* Input Strategy Tabs */}
          <div className="flex items-center gap-2 p-1.5 bg-surface-container-lowest/50 backdrop-blur-md rounded-full w-fit border border-outline-variant/30 inner-highlight">
            <button
              onClick={() => setTab("precise")}
              className={`px-6 py-2.5 rounded-full font-body-base text-xs font-semibold tracking-wider font-label-caps transition-all flex items-center gap-2 ${
                tab === "precise"
                  ? "bg-surface-container-highest text-on-surface border border-outline-variant/50 shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
              aria-label="Precise sliders tab"
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
              PRECISE (SLIDERS)
            </button>
            <button
              onClick={() => setTab("quick")}
              className={`px-6 py-2.5 rounded-full font-body-base text-xs font-semibold tracking-wider font-label-caps transition-all flex items-center gap-2 ${
                tab === "quick"
                  ? "bg-surface-container-highest text-on-surface border border-outline-variant/50 shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
              aria-label="Quick describe tab"
            >
              <span className="material-symbols-outlined text-[18px]">edit_note</span>
              QUICK (DESCRIBE IT)
            </button>
          </div>

          {/* Tab Contents */}
          {tab === "precise" ? (
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
                      onChange={(val) => handleSliderChange(config.key as keyof UserInputs, val)}
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
                          onClick={() => handleDietSelect(option.value)}
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
          ) : (
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-xl opacity-50 transition duration-500" />
              <div className="relative bg-surface-container-low/80 backdrop-blur-2xl border border-outline-variant/50 rounded-2xl p-6 md:p-8 inner-highlight shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                <textarea
                  value={nlpText}
                  onChange={(e) => setNlpText(e.target.value)}
                  placeholder="Tell us about a typical month. e.g., 'I drive about 200 miles a week in an SUV, eat meat most days, and took two short domestic flights this year.'"
                  className="w-full h-40 bg-transparent border-none focus:ring-0 resize-none font-body-base text-body-base text-on-surface placeholder:text-on-surface-variant/50 p-0 outline-none"
                  aria-label="Describe your lifestyle"
                />
                
                <div className="mt-4 flex justify-between items-center">
                  <button
                    onClick={handleNLPSubmit}
                    disabled={!nlpText.trim()}
                    className="px-6 py-2.5 rounded-full bg-surface-container-highest border border-outline-variant/50 text-on-surface text-xs font-bold font-label-caps tracking-wider transition-all hover:bg-surface-bright/80 disabled:opacity-50"
                  >
                    PARSE SIGNALS
                  </button>

                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary animate-pulse">
                    <span className="material-symbols-outlined text-[18px]">robot_2</span>
                  </div>
                </div>

                {parsedFields.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-outline-variant/30 flex flex-wrap gap-3 items-center">
                    <span className="font-label-caps text-label-caps text-on-surface-variant mr-2">Extracted Signals:</span>
                    {parsedFields.map((field, idx) => {
                      const DetectedIcon = field.icon;
                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container text-on-surface font-body-base text-xs font-semibold border border-outline-variant/50"
                        >
                          <DetectedIcon className="w-3.5 h-3.5 text-primary" />
                          {field.label}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action */}
          <div className="mt-4">
            <button
              onClick={() => onComplete(inputs)}
              disabled={!isValid}
              className="flex items-center justify-center gap-3 w-full md:w-auto px-8 py-4 bg-primary text-on-primary rounded-full font-body-base text-xs font-bold font-label-caps tracking-wider hover:bg-primary-fixed hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-[0_0_30px_rgba(75,226,119,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              SEE MY DASHBOARD
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Column: Persistent Sidebar Preview */}
        <div className="md:col-span-4 md:col-start-9 mt-12 md:mt-0 fade-in-rise delay-200">
          <div className="sticky top-32 bg-surface-container-high/40 backdrop-blur-xl border border-outline-variant/50 rounded-2xl p-8 inner-highlight shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between mb-8 border-b border-outline-variant/30 pb-4">
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider text-[10px]">Live Preview</span>
              <span className="material-symbols-outlined text-primary text-[20px]">eco</span>
            </div>

            <div className="flex flex-col gap-2 mb-8">
              <span className="font-body-base text-body-base text-on-surface-variant">Estimated Annual Impact</span>
              <div className="flex items-baseline gap-2">
                <motion.span className="font-data-metric text-[48px] text-primary tracking-tighter font-bold">
                  {animatedDisplay}
                </motion.span>
                <span className="font-label-caps text-label-caps text-on-surface-variant">Tons CO₂e</span>
              </div>
            </div>

            {/* Comparison Context */}
            <div className="space-y-4">
              <div className="flex justify-between font-label-caps text-label-caps">
                <span className="text-on-surface-variant">vs. Persona Average ({(personaBaselineTotal / 1000).toFixed(1)}t)</span>
                <span className={isAboveBaseline ? "text-error" : "text-primary"}>
                  {comparisonPercentText}
                </span>
              </div>

              {/* Custom Data Visualization Bar */}
              <div className="relative h-2 w-full bg-surface-container-lowest rounded-full overflow-hidden">
                {/* Average Marker */}
                <div className="absolute top-0 bottom-0 left-[50%] w-0.5 bg-on-surface-variant z-10" />
                {/* Current Score Fill */}
                <div 
                  className={`absolute top-0 bottom-0 left-0 rounded-full opacity-80 transition-all duration-500 ${
                    isAboveBaseline ? "bg-gradient-to-r from-primary to-error" : "bg-primary"
                  }`} 
                  style={{ width: `${Math.min(100, Math.max(10, (result.totalKgCO2PerYear / (personaBaselineTotal * 2)) * 100))}%` }}
                />
              </div>

              <p className="font-body-base text-body-base text-sm text-on-surface-variant/70 leading-relaxed mt-4">
                {result.topCategory === "transport" && "Your commuting and travel emissions represent the largest portion of your footprint."}
                {result.topCategory === "energy" && "Your household heating and electricity emissions represent the largest portion of your footprint."}
                {result.topCategory === "diet" && "Your dietary choices represent the largest portion of your footprint."}
                {result.topCategory === "shopping" && "Your online shopping frequency represents the largest portion of your footprint."}
                {" We'll identify specific reduction strategies in your personalized dashboard."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
