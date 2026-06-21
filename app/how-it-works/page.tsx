"use client";

import React from "react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { GlassCard } from "@/components/ui/GlassCard";
import { EyebrowBadge } from "@/components/ui/EyebrowBadge";

export default function HowItWorks() {
  return (
    <main className="min-h-screen bg-background relative overflow-x-hidden font-body-base">
      {/* Fixed Cinematic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div 
          className="w-full h-full bg-cover bg-center opacity-30 mix-blend-luminosity" 
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCgVFNK8MqDYxHQPg9PlFyYWVUQihcF-tBjeYjpD1tSEkDYHk0r_4qMvXqGkltR3i21iRXHiRMyyCnFJRHPNGNx8SIAS7aR8Lu1mjM_6hsaRDyLiaOf_0Nu3AsG0fvo_N6j4fX4-RcE-CoTv4rmdsbtl7jBmTYsZh6YNXDPF7lFniHDz37fq_5hGebVh8zuTmKukjIz3Oiogh1l94iljk_iwe_8QuKCD4fsPWT0IjcnsMdcnpc3ZgqodhatAWECMmye1DDtcJPr0TJl')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
      </div>

      <Navbar />

      <div className="relative z-10 pt-[140px] pb-24 px-margin-mobile md:px-margin-desktop max-w-4xl mx-auto flex flex-col gap-12">
        <header className="flex flex-col items-center text-center gap-4 fade-in-rise">
          <EyebrowBadge icon="psychology">Methodology & Explainability</EyebrowBadge>
          <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface">
            How Carbon Coach <span className="font-editorial-italic text-editorial-italic text-primary">Generates Recommendations</span>
          </h1>
          <p className="font-body-base text-body-base text-on-surface-variant max-w-2xl">
            An look inside the math, algorithms, and AI decision logic that turn daily lifestyle parameters into a personalized carbon reduction strategy.
          </p>
        </header>

        <section className="flex flex-col gap-6 fade-in-rise delay-100">
          {/* Step 1: Inputs */}
          <GlassCard className="flex flex-col gap-4">
            <h3 className="font-headline-md text-xl font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">input</span>
              1. Multi-Modal Input Collection
            </h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Carbon Coach supports two entry points to accommodate different user preferences:
            </p>
            <ul className="list-disc list-inside text-sm text-on-surface-variant space-y-2 pl-4">
              <li>
                <strong className="text-on-surface">Precise Inputs:</strong> Interactive sliders that capture travel metrics (km/week), flights, monthly electricity/gas usage, e-commerce orders, and diet selections.
              </li>
              <li>
                <strong className="text-on-surface">Natural Language Processing (NLP):</strong> A text parser matches phrasing signatures using regular expression patterns to translate natural lifestyle descriptions (e.g., &quot;I drive ~150 miles and eat vegan&quot;) into structured numerical parameters.
              </li>
            </ul>
          </GlassCard>

          {/* Step 2: Footprint Calculation */}
          <GlassCard className="flex flex-col gap-4">
            <h3 className="font-headline-md text-xl font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">calculate</span>
              2. Scientific Emission Calculations
            </h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              We apply standard emission coefficients to user inputs to calculate annual carbon equivalent metrics (kg CO₂e/year) across four sectors:
            </p>
            <div className="overflow-x-auto my-2">
              <table className="w-full text-left text-xs border border-white/10 rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-surface-container border-b border-white/10 text-on-surface-variant font-label-caps font-semibold">
                    <th className="py-2.5 px-4">Sector</th>
                    <th className="py-2.5 px-4">Formula</th>
                    <th className="py-2.5 px-4">Emission Factor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-on-surface-variant">
                  <tr>
                    <td className="py-2.5 px-4 font-semibold text-on-surface">🚗 Transport</td>
                    <td className="py-2.5 px-4">Car km × 52 × factor + Transit km × 52 × factor + Flights × factor</td>
                    <td className="py-2.5 px-4">0.251 kg/km (Car), 0.089 kg/km (Transit), 637.5 kg/trip (Flight)</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-semibold text-on-surface">🍔 Diet</td>
                    <td className="py-2.5 px-4">Diet type baseline emissions (standardized annual baseline)</td>
                    <td className="py-2.5 px-4">1500 kg (Vegan), 1700 kg (Vegetarian), 2500 kg (Omnivore), 3300 kg (Heavy Meat)</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-semibold text-on-surface">⚡ Home Energy</td>
                    <td className="py-2.5 px-4">Electricity kWh × 12 × factor + Gas therms × 12 × factor</td>
                    <td className="py-2.5 px-4">0.42 kg/kWh (Electricity), 5.3 kg/therm (Natural Gas)</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-semibold text-on-surface">📦 Shopping</td>
                    <td className="py-2.5 px-4">Online orders × 12 × factor</td>
                    <td className="py-2.5 px-4">3.5 kg/order</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </GlassCard>

          {/* Step 3: EcoScore */}
          <GlassCard className="flex flex-col gap-4">
            <h3 className="font-headline-md text-xl font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">workspace_premium</span>
              3. Gamified EcoScore System
            </h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              We gamify environmental stewardship using a multi-dimensional scoring model to calculate a user&apos;s level (from 1 to 5):
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-surface-container/40 p-4 rounded-xl border border-white/5 space-y-1">
                <span className="font-semibold text-on-surface block">Points Formula</span>
                <p className="text-on-surface-variant leading-relaxed">
                  Score = 100 (Base) + (Actions × 50) + min(Streak × 10, 100) + (floor(kg Saved / 1000) × 200)
                </p>
              </div>
              <div className="bg-surface-container/40 p-4 rounded-xl border border-white/5 space-y-1">
                <span className="font-semibold text-on-surface block">Steward Levels</span>
                <ul className="list-disc list-inside space-y-1 text-on-surface-variant">
                  <li>Level 1 (0–199 points): **Seedling**</li>
                  <li>Level 2 (200–499 points): **Sprout**</li>
                  <li>Level 3 (500–999 points): **Guardian**</li>
                  <li>Level 4 (1000–1999 points): **Champion**</li>
                  <li>Level 5 (2000+ points): **Planet Hero**</li>
                </ul>
              </div>
            </div>
          </GlassCard>

          {/* Step 4: AI Prioritization */}
          <GlassCard className="flex flex-col gap-4">
            <h3 className="font-headline-md text-xl font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">psychology</span>
              4. AI Recommendation Prioritization Logic
            </h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Our **EcoMind AI Coach** utilizes the `gemini-3.1-flash-lite` model. It makes context-aware, analytical recommendations rather than displaying generic text:
            </p>
            <ul className="list-disc list-inside text-sm text-on-surface-variant space-y-2.5 pl-4">
              <li>
                <strong className="text-on-surface">Targeted Category Focus:</strong> The system analyzes the user&apos;s highest emission sectors and prioritizes actions in those categories first (e.g. driving reductions for transit-heavy users).
              </li>
              <li>
                <strong className="text-on-surface">Clarity & Justification:</strong> For every action generated, the AI outputs a dedicated decision trace detailing the estimated annual savings (kg CO₂) and the science-backed reasoning explaining why the recommendation has been prioritized.
              </li>
              <li>
                <strong className="text-on-surface">Duplicate Prevention:</strong> The API route receives the user&apos;s active/completed actions and filters out already adopted habits to suggest only new, relevant actions.
              </li>
            </ul>
          </GlassCard>

          {/* Step 5: Time Machine Projection */}
          <GlassCard className="flex flex-col gap-4">
            <h3 className="font-headline-md text-xl font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">history</span>
              5. Future Projections (Carbon Time Machine)
            </h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              The Carbon Time Machine simulates multi-decade cumulative savings under various scenarios (10, 20, and 30-year projections) using a linear scaling model. It dynamically adjusts projection baselines as users adopt more habits or check off tasks in the Action Tracker, giving a tangible visual representation of long-term climate stewardship.
            </p>
          </GlassCard>
        </section>
      </div>

      <Footer />
    </main>
  );
}
