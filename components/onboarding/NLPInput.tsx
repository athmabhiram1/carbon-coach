import React, { useState, useCallback } from "react";
import { Car, Plane, Leaf, Apple, Utensils, Flame } from "lucide-react";
import { parseNLP } from "@/lib/validation/nlp";
import { UserInputs } from "@/lib/carbon";

interface NLPInputProps {
  onParsed: (inputs: Partial<UserInputs>, detected: { label: string; icon: React.ComponentType<{ className?: string }> }[]) => void;
}

const DIET_OPTIONS = [
  { value: "vegan" as const, label: "Vegan", icon: Leaf },
  { value: "vegetarian" as const, label: "Vegetarian", icon: Apple },
  { value: "omnivore" as const, label: "Omnivore", icon: Utensils },
  { value: "heavy-meat" as const, label: "Heavy Meat", icon: Flame },
];

export function NLPInput({ onParsed }: NLPInputProps) {
  const [nlpText, setNlpText] = useState("");
  const [parsedFields, setParsedFields] = useState<{ label: string; icon: React.ComponentType<{ className?: string }> }[]>([]);

  const handleNLPSubmit = useCallback(() => {
    const parsed = parseNLP(nlpText);
    const detected: { label: string; icon: React.ComponentType<{ className?: string }> }[] = [];
    if (parsed.kmDrivenPerWeek !== undefined) detected.push({ label: "Driving", icon: Car });
    if (parsed.dietType) {
      const icon = DIET_OPTIONS.find((o) => o.value === parsed.dietType)?.icon ?? Leaf;
      detected.push({ label: `${parsed.dietType} diet`, icon });
    }
    if (parsed.flightsPerYear !== undefined) detected.push({ label: `${parsed.flightsPerYear} flights`, icon: Plane });

    setParsedFields(detected);
    onParsed(parsed, detected);
  }, [nlpText, onParsed]);

  return (
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
  );
}
