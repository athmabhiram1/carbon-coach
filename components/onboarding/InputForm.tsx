"use client";

import { useState, useMemo, useCallback } from "react";
import { ArrowRight } from "lucide-react";
import { calculateFootprint } from "@/lib/carbon";
import type { UserInputs } from "@/lib/carbon";
import { Persona } from "@/lib/personas";
import { PreciseSliders } from "./PreciseSliders";
import { NLPInput } from "./NLPInput";
import { PreviewSidebar } from "./PreviewSidebar";

interface InputFormProps {
  persona: Persona;
  onComplete: (inputs: UserInputs) => void;
}

type Tab = "precise" | "quick";

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

  const result = useMemo(
    () => calculateFootprint(inputs, persona),
    [inputs, persona]
  );

  const handleSliderChange = useCallback(
    (key: keyof UserInputs, value: number) => {
      setInputs((prev) => ({ ...prev, [key]: Math.max(0, value) }));
    },
    []
  );

  const handleDietSelect = useCallback((diet: UserInputs["dietType"]) => {
    setInputs((prev) => ({ ...prev, dietType: diet }));
  }, []);

  const handleNLPParsed = useCallback((parsedInputs: Partial<UserInputs>) => {
    setInputs((prev) => ({ ...prev, ...parsedInputs }));
  }, []);

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
            <PreciseSliders
              inputs={inputs}
              onSliderChange={handleSliderChange}
              onDietSelect={handleDietSelect}
            />
          ) : (
            <NLPInput onParsed={handleNLPParsed} />
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
          <PreviewSidebar result={result} persona={persona} />
        </div>
      </div>
    </section>
  );
}
