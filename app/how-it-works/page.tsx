"use client";

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
          <EyebrowBadge icon="help">Methodology</EyebrowBadge>
          <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface">
            How Carbon Coach <span className="font-editorial-italic text-editorial-italic text-primary">Works</span>
          </h1>
          <p className="font-body-base text-body-base text-on-surface-variant max-w-2xl">
            Our platform provides scientific estimates of lifestyle carbon emissions and utilizes AI models to guide individual reductions.
          </p>
        </header>

        <section className="flex flex-col gap-6 fade-in-rise delay-100">
          <GlassCard className="flex flex-col gap-4">
            <h3 className="font-headline-md text-xl font-bold text-on-surface">1. Carbon Calculations</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              We divide calculations into four core categories based on regional lifestyle averages:
            </p>
            <ul className="list-disc list-inside text-sm text-on-surface-variant space-y-2 pl-4">
              <li><strong className="text-on-surface">Transport:</strong> Derived from weekly car usage and flight frequencies.</li>
              <li><strong className="text-on-surface">Diet:</strong> Evaluated based on meat and vegetable intake profiles.</li>
              <li><strong className="text-on-surface">Home Energy:</strong> Scaled to typical monthly electricity and natural gas therms.</li>
              <li><strong className="text-on-surface">Shopping:</strong> Estimated carbon cost of monthly e-commerce shipping.</li>
            </ul>
          </GlassCard>

          <GlassCard className="flex flex-col gap-4">
            <h3 className="font-headline-md text-xl font-bold text-on-surface">2. EcoScore Rankings</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Stewards earn points by logging habits, resolving carbon reduction tasks, and maintaining logging streaks. High standing allows climbing to sprout, guardian, and planet hero levels.
            </p>
          </GlassCard>
        </section>
      </div>

      <Footer />
    </main>
  );
}
