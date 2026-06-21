"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { Persona, personas, getPersonaIconComponent } from "@/lib/personas";

interface PersonaSelectorProps {
  selectedId: string | null;
  onSelect: (persona: Persona) => void;
}

export default function PersonaSelector({
  selectedId,
  onSelect,
}: PersonaSelectorProps) {
  const reduced = useReducedMotion();

  return (
    <section className="w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pt-24 pb-8 relative z-10">
      <header className="flex flex-col items-center text-center gap-4 mb-12 fade-in-rise">
        <span className="font-label-caps text-label-caps text-primary uppercase tracking-widest">
          Onboarding · Phase I
        </span>
        <h2 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-on-surface">
          Select Your <span className="font-editorial-italic text-editorial-italic text-primary">Persona</span>
        </h2>
        <p className="font-body-base text-body-base text-on-surface-variant max-w-xl">
          Choose the starting profile that closest matches your current daily lifestyle habits. We will customize it in the next step.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-5 fade-in-rise delay-100">
        {personas.map((persona, index) => {
          const isSelected = selectedId === persona.id;
          const baselineTotal = Object.values(persona.baseline).reduce((a, b) => a + b, 0);

          return (
            <motion.button
              key={persona.id}
              onClick={() => onSelect(persona)}
              className={`relative flex flex-col items-center justify-between rounded-2xl p-6 text-center transition-all duration-300 min-h-[250px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] ${
                isSelected
                  ? "bg-primary-container/20 border-2 border-primary shadow-[0_0_30px_rgba(75,226,119,0.2)]"
                  : "bg-surface-container-low/40 backdrop-blur-xl border border-white/10 hover:border-white/20 hover:bg-surface-container-high/40"
              }`}
              initial={reduced ? {} : { opacity: 0, y: 20 }}
              whileInView={reduced ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={reduced ? { duration: 0 } : { delay: index * 0.05, duration: 0.5 }}
              whileHover={reduced ? {} : { scale: 1.03 }}
              whileTap={reduced ? {} : { scale: 0.98 }}
              aria-label={`Select ${persona.name}`}
            >
              {/* Top border ambient glow highlight for non-selected cards */}
              {!isSelected && <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />}

              <div className="flex flex-col items-center gap-3 w-full">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-inner ${
                  isSelected ? "bg-primary text-on-primary" : "bg-surface-container-highest/60 text-primary border border-white/5"
                }`}>
                  {(() => {
                    const IconComp = getPersonaIconComponent(persona.icon);
                    return <IconComp className="w-7 h-7" aria-label={persona.name} />;
                  })()}
                </div>

                <h3 className="font-headline-md text-lg font-bold text-on-surface">
                  {persona.name}
                </h3>
                <p className="font-body-base text-xs text-on-surface-variant line-clamp-3 leading-relaxed">
                  {persona.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 w-full flex flex-col items-center gap-1">
                <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider">
                  Baseline Footprint
                </span>
                <span className="font-data-metric text-base font-semibold text-primary">
                  {(baselineTotal / 1000).toFixed(1)} <span className="text-xs font-normal text-on-surface-variant font-body-base">Tons/yr</span>
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
