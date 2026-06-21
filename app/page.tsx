"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import HeroCounter from "@/components/onboarding/HeroCounter";
import PersonaSelector from "@/components/onboarding/PersonaSelector";
import InputForm from "@/components/onboarding/InputForm";
import StorageWarning from "@/components/StorageWarning";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import type { Persona } from "@/lib/personas";
import type { UserInputs } from "@/lib/carbonCalculator";
import { safeGetItem, safeSetItem } from "@/lib/storage";

interface SavedData {
  anonymousId: string;
  personaId: string;
  inputs: UserInputs;
  timestamp: number;
}

export default function Home() {
  const router = useRouter();
  const [step, setStep] = useState<"hero" | "onboarding">("hero");
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const handleHeroComplete = useCallback(() => {
    setStep("onboarding");
  }, []);

  const handlePersonaSelect = useCallback((persona: Persona) => {
    setSelectedPersona(persona);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, []);

  const handleInputComplete = useCallback(
    (inputs: UserInputs) => {
      const existingId = safeGetItem("carbon-coach-anonymous-id");
      const anonymousId = existingId || uuidv4();

      if (!existingId) {
        safeSetItem("carbon-coach-anonymous-id", anonymousId);
      }

      const data: SavedData = {
        anonymousId,
        personaId: selectedPersona!.id,
        inputs,
        timestamp: Date.now(),
      };

      safeSetItem("carbon-coach-data", JSON.stringify(data));

      router.push("/dashboard");
    },
    [selectedPersona, router]
  );

  return (
    <main className="min-h-screen bg-background relative overflow-x-hidden flex flex-col justify-between">
      <StorageWarning />
      
      {/* Floating glass navbar */}
      <Navbar />

      {step === "hero" && <HeroCounter onComplete={handleHeroComplete} />}

      {step === "onboarding" && (
        <div className="relative min-h-screen flex-grow">
          {/* Fixed Cinematic Background */}
          <div className="fixed inset-0 z-0 pointer-events-none">
            <img 
              className="w-full h-full object-cover opacity-60 mix-blend-luminosity" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFtPszxelCFQ2gWZw5vQGByrh478qtMKEdShGRHK3OISYRV-DnM1qWhwUBYrbr-d52Xd6vJMPvMYVXVDt_EV98ZuKJaAC68t2PpecwGOalR9G4LrvGoAcUt86eQtW63Yr-DAqeJct27e-XKFhkc-z2hbKR4ZFtngZVsyVKuPdAzdblNVrkzfjBThxoHXKYR_ruUi0myScIMwbyckUOxqS5QhIcjUAHL-OKJ0bIclz2CuDxyx4IgjMDpw98wQ7bvM4c1wr4FtJ3TwXS" 
              alt="Misty Forest" 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
          </div>

          <div className="relative z-10 pt-[120px] pb-16">
            <PersonaSelector
              selectedId={selectedPersona?.id ?? null}
              onSelect={handlePersonaSelect}
            />

            {selectedPersona && (
              <div ref={formRef} className="mt-8">
                <InputForm
                  persona={selectedPersona}
                  onComplete={handleInputComplete}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Shared Footer */}
      <Footer />
    </main>
  );
}
