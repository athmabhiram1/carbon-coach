"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import ErrorBoundary from "@/components/ErrorBoundary";
import StorageWarning from "@/components/StorageWarning";
import ScoreGauge from "@/components/dashboard/ScoreGauge";
import EcoScorePanel from "@/components/dashboard/EcoScorePanel";
import ActionTracker from "@/components/dashboard/ActionTracker";
import ScenarioSimulator from "@/components/dashboard/ScenarioSimulator";
import CarbonTimeMachine from "@/components/dashboard/CarbonTimeMachine";
import ImpactCard from "@/components/dashboard/ImpactCard";
import LeaderboardPreview from "@/components/dashboard/LeaderboardPreview";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { GlassCard } from "@/components/ui/GlassCard";
import { getPersonaById } from "@/lib/personas";
import { calculateFootprint, UserInputs } from "@/lib/carbonCalculator";
import { calculateEcoScore } from "@/lib/ecoScore";
import { safeGetItem, safeSetItem } from "@/lib/storage";
import type { FootprintResult } from "@/lib/carbonCalculator";
import type { Persona } from "@/lib/personas";
import type { EcoScore } from "@/lib/ecoScore";
import type { Action } from "@/lib/timeMachine";
import { useAuth } from "@/lib/hooks/useAuth";
import Link from "next/link";

const BreakdownChart = dynamic(
  () => import("@/components/dashboard/BreakdownChart"),
  { ssr: false, loading: () => <div className="h-[360px] animate-pulse rounded-2xl bg-surface-container-high/40" /> }
);

const AICoach = dynamic(
  () => import("@/components/dashboard/AICoach"),
  { ssr: false, loading: () => <div className="h-[360px] animate-pulse rounded-2xl bg-surface-container-high/40" /> }
);



const DEFAULT_ACTIONS: Action[] = [
  { id: "reduce-driving", label: "Reduce driving by 20%", savingsKg: 500 },
  { id: "go-vegan", label: "Switch to vegan diet", savingsKg: 1000 },
  { id: "less-flying", label: "Take 50% fewer flights", savingsKg: 1200 },
  { id: "renewable-energy", label: "Use renewable energy", savingsKg: 800 },
  { id: "reduce-shopping", label: "Reduce online shopping by 30%", savingsKg: 300 },
];

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [persona, setPersona] = useState<Persona | null>(null);
  const [inputs, setInputs] = useState<UserInputs | null>(null);
  const [result, setResult] = useState<FootprintResult | null>(null);
  const [ecoScore, setEcoScore] = useState<EcoScore | null>(null);
  const [checkedActions, setCheckedActions] = useState<string[]>([]);
  const [customActions, setCustomActions] = useState<Action[]>([]);
  const [anonymousId, setAnonymousId] = useState<string>("");

  const getAnonId = () => typeof window !== "undefined" ? localStorage.getItem("carbon-coach-anonymous-id") || "" : "";

  const [userRank] = useState<number | undefined>();
  const [totalUsers, setTotalUsers] = useState<number | undefined>();

  const allActions = useMemo(
    () => [...DEFAULT_ACTIONS, ...customActions],
    [customActions]
  );

  useMemo(() => {
    const savedCustom = safeGetItem("carbon-coach-custom-actions");
    if (savedCustom) {
      try {
        setCustomActions(JSON.parse(savedCustom));
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const anon = getAnonId();
        const idParam = anon ? `?anonymous_id=${anon}` : "";
        const apiRes = await fetch(`/api/footprint${idParam}`);
        
        let dbFootprint = null;
        if (apiRes.ok) {
          dbFootprint = await apiRes.json();
        }

        if (dbFootprint) {
          const p = getPersonaById(dbFootprint.persona_id);
          if (p) {
            setPersona(p);
            setAnonymousId(dbFootprint.anonymous_id || "");

            // Attempt to restore user inputs from localStorage
            const savedRaw = safeGetItem("carbon-coach-data");
            let reconstructedInputs = null;
            if (savedRaw) {
              try {
                const saved = JSON.parse(savedRaw);
                if (saved.personaId === p.id) {
                  reconstructedInputs = saved.inputs;
                }
              } catch {}
            }

            // Fallback to estimation from persona if not found in localStorage
            if (!reconstructedInputs) {
              reconstructedInputs = {
                kmDrivenPerWeek: p.id === "daily-commuter" ? 300 : p.id === "frequent-flyer" ? 50 : p.id === "eco-conscious" ? 20 : p.id === "student" ? 10 : 80,
                publicTransportKmPerWeek: p.id === "student" ? 100 : p.id === "eco-conscious" ? 80 : 20,
                flightsPerYear: p.id === "frequent-flyer" ? 20 : p.id === "daily-commuter" ? 2 : p.id === "remote-worker" ? 3 : p.id === "student" ? 1 : 0,
                dietType: p.id === "eco-conscious" ? "vegan" : p.id === "student" ? "vegetarian" : "omnivore",
                electricityKwhPerMonth: p.id === "remote-worker" ? 800 : p.id === "frequent-flyer" ? 300 : p.id === "daily-commuter" ? 500 : p.id === "student" ? 200 : 400,
                onlineOrdersPerMonth: p.id === "frequent-flyer" ? 15 : p.id === "remote-worker" ? 10 : p.id === "daily-commuter" ? 5 : p.id === "student" ? 2 : 3,
                naturalGasThermsPerMonth: p.id === "remote-worker" ? 50 : p.id === "daily-commuter" ? 40 : p.id === "student" ? 15 : 20,
              };
            }

            setInputs(reconstructedInputs);

            const footprint = calculateFootprint(reconstructedInputs, p);
            setResult(footprint);

            const savedChecked = safeGetItem("carbon-coach-checked-actions");
            const checked = savedChecked ? JSON.parse(savedChecked) : [];
            setCheckedActions(checked);

            const score = calculateEcoScore(
              checked.length,
              0,
              checked.reduce((sum: number, id: string) => {
                const action = allActions.find((a) => a.id === id);
                return sum + (action?.savingsKg ?? 0);
              }, 0)
            );
            setEcoScore(score);
            setLoading(false);
          }
        } else {
          // Fallback to local storage
          const savedRaw = safeGetItem("carbon-coach-data");
          const localAnonId = safeGetItem("carbon-coach-anonymous-id");

          if (!savedRaw || !localAnonId) {
            router.push("/");
            return;
          }

          setAnonymousId(localAnonId);
          const saved = JSON.parse(savedRaw);
          const p = getPersonaById(saved.personaId);
          if (p) {
            setPersona(p);
            setInputs(saved.inputs);

            const footprint = calculateFootprint(saved.inputs, p);
            setResult(footprint);

            const savedChecked = safeGetItem("carbon-coach-checked-actions");
            const checked = savedChecked ? JSON.parse(savedChecked) : [];
            setCheckedActions(checked);

            const score = calculateEcoScore(
              checked.length,
              0,
              checked.reduce((sum: number, id: string) => {
                const action = allActions.find((a) => a.id === id);
                return sum + (action?.savingsKg ?? 0);
              }, 0)
            );
            setEcoScore(score);
            setLoading(false);
          }
        }

        // Fetch leaderboard totals
        const rankRes = await fetch(`/api/leaderboard`);
        if (rankRes.ok) {
          const json = await rankRes.json();
          if (json.totalCount) setTotalUsers(json.totalCount);
        }
      } catch (err) {
        console.error("Dashboard loading error:", err);
        const savedRaw = safeGetItem("carbon-coach-data");
        if (savedRaw) {
          try {
            const saved = JSON.parse(savedRaw);
            const p = getPersonaById(saved.personaId);
            if (p) {
              setPersona(p);
              setInputs(saved.inputs);
              setResult(calculateFootprint(saved.inputs, p));
              setLoading(false);
              return;
            }
          } catch {}
        }
        router.push("/");
      }
    };

    loadData();
  }, [authLoading, router, allActions]);

  const recalcEcoScore = useCallback(
    (checked: string[], actions: Action[]) => {
      const totalSaved = actions
        .filter((a) => checked.includes(a.id))
        .reduce((sum, a) => sum + a.savingsKg, 0);

      if (ecoScore) {
        const newScore = calculateEcoScore(
          checked.length,
          0,
          totalSaved
        );
        setEcoScore(newScore);
      }
    },
    [ecoScore]
  );

  const persistToSupabase = useCallback(
    (checked: string[], actions: Action[]) => {
      if ((!user && !anonymousId) || !result || !persona || !inputs) return;

      try {
        fetch("/api/footprint", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            anonymousId: user ? null : anonymousId,
            personaId: persona.id,
            totalKgCO2PerYear: result.totalKgCO2PerYear,
            breakdown: result.breakdown,
            severity: result.severity,
            topCategory: result.topCategory,
            comparisonToNationalAvg: result.comparisonToNationalAverage,
            comparisonToPersonaBaseline: result.comparisonToPersonaBaseline,
            actionsTaken: checked.map((id) => {
              const action = actions.find((a) => a.id === id);
              return {
                id,
                label: action?.label ?? id,
                savingsKg: action?.savingsKg ?? 0,
                checked: true,
              };
            }),
            ecoScore: ecoScore?.score ?? 0,
            ecoLevel: ecoScore?.level ?? 1,
            streakDays: 0,
          }),
        }).catch(() => {});
      } catch {}
    },
    [user, anonymousId, result, persona, inputs, ecoScore]
  );

  const handleActionToggle = useCallback(
    (actionId: string) => {
      setCheckedActions((prev) => {
        const updated = prev.includes(actionId)
          ? prev.filter((id) => id !== actionId)
          : [...prev, actionId];

        safeSetItem(
          "carbon-coach-checked-actions",
          JSON.stringify(updated)
        );

        recalcEcoScore(updated, allActions);
        persistToSupabase(updated, allActions);

        return updated;
      });
    },
    [recalcEcoScore, persistToSupabase, allActions]
  );

  const handleAddCustomAction = useCallback(
    (action: Action) => {
      setCustomActions((prev) => {
        const updated = [...prev, action];
        safeSetItem("carbon-coach-custom-actions", JSON.stringify(updated));
        return updated;
      });
    },
    []
  );

  const handleAISuggestedActions = useCallback(
    (suggestedActions: Action[]) => {
      setCustomActions((prev) => {
        const existing = new Set(prev.map((a) => a.label.toLowerCase()));
        const newActions = suggestedActions.filter(
          (a) => !existing.has(a.label.toLowerCase())
        );
        if (newActions.length === 0) return prev;
        const updated = [...prev, ...newActions];
        safeSetItem("carbon-coach-custom-actions", JSON.stringify(updated));
        return updated;
      });
    },
    []
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-background p-8 flex flex-col justify-center items-center font-body-base" role="main">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-4" />
        <p className="font-label-caps text-label-caps text-on-surface-variant tracking-wider">LOADING DASHBOARD</p>
      </main>
    );
  }

  if (!result || !ecoScore || !persona || !inputs) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background" role="main">
        <p className="text-on-surface-variant font-label-caps animate-pulse">Redirecting...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background relative overflow-x-hidden font-body-base flex flex-col justify-between" role="main">
      {/* Fixed Background Image and Ambient Glow Blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div 
          className="w-full h-full bg-cover bg-center opacity-25 mix-blend-luminosity" 
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCgVFNK8MqDYxHQPg9PlFyYWVUQihcF-tBjeYjpD1tSEkDYHk0r_4qMvXqGkltR3i21iRXHiRMyyCnFJRHPNGNx8SIAS7aR8Lu1mjM_6hsaRDyLiaOf_0Nu3AsG0fvo_N6j4fX4-RcE-CoTv4rmdsbtl7jBmTYsZh6YNXDPF7lFniHDz37fq_5hGebVh8zuTmKukjIz3Oiogh1l94iljk_iwe_8QuKCD4fsPWT0IjcnsMdcnpc3ZgqodhatAWECMmye1DDtcJPr0TJl')" }}
        />
        {/* Organic ambient light blobs */}
        <div className="absolute top-[10%] left-[-15%] w-[600px] h-[600px] rounded-full bg-primary/10 blur-[150px] mix-blend-screen animate-[pulse_8s_infinite_ease-in-out]" />
        <div className="absolute bottom-[20%] right-[-15%] w-[700px] h-[700px] rounded-full bg-secondary/15 blur-[180px] mix-blend-screen" />
        <div className="absolute top-[50%] left-[30%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[130px] mix-blend-screen animate-[pulse_12s_infinite_ease-in-out]" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background" />
      </div>

      <Navbar />

      {/* Main Content Canvas */}
      <div className="relative z-10 pt-[120px] pb-section-gap px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto space-y-gutter flex-grow w-full">
        <StorageWarning />

        {!user && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-on-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4 fade-in-rise">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-amber-500 text-[24px]">shield_alert</span>
              <div className="flex flex-col text-left">
                <span className="text-sm font-semibold">Guest Session Active</span>
                <span className="text-xs text-on-surface-variant">Sign in to sync your carbon score and streaks across devices.</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/auth/sign-in"
                className="px-4 py-2 bg-primary text-on-primary text-xs font-bold rounded-full hover:bg-primary-fixed scale-95 active:scale-90 transition-all font-label-caps"
              >
                SIGN IN
              </Link>
            </div>
          </div>
        )}

        {/* Header Section */}
        <header className="fade-in-rise mb-8">
          <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface">Your Impact</h1>
          <p className="font-editorial-italic text-editorial-italic text-secondary mt-2 max-w-2xl">A real-time reflection of your environmental footprint.</p>
        </header>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter auto-rows-min">
          {/* Primary Gauge Card (Col-span-8) */}
          <div className="md:col-span-8">
            <ErrorBoundary>
              <ScoreGauge result={result} personaName={persona.name} />
            </ErrorBoundary>
          </div>

          {/* EcoScore & Streak Panel (Col-span-4) */}
          <div className="md:col-span-4">
            <ErrorBoundary>
              <EcoScorePanel
                ecoScore={ecoScore}
                rank={userRank}
                totalUsers={totalUsers}
              />
            </ErrorBoundary>
          </div>

          {/* Breakdown Chart (Col-span-4) */}
          <div className="md:col-span-4">
            <ErrorBoundary>
              <BreakdownChart breakdown={result.breakdown} />
            </ErrorBoundary>
          </div>

          {/* EcoMind AI Coach (Col-span-8) */}
          <div className="md:col-span-8">
            <ErrorBoundary>
              <AICoach
                persona={persona}
                result={result}
                existingActions={allActions}
                onActionsSuggested={handleAISuggestedActions}
              />
            </ErrorBoundary>
          </div>
        </div>

        {/* Other dashboard panels structured in secondary grid using GlassCard wrappers */}
        <div className="grid grid-cols-1 gap-gutter md:grid-cols-2 mt-8">
          <GlassCard>
            <h3 className="font-headline-md text-xl font-bold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[24px]">playlist_add_check</span> Action Tracker
            </h3>
            <ErrorBoundary>
              <ActionTracker
                actions={allActions}
                checkedActions={checkedActions}
                onToggle={handleActionToggle}
                onEcoScoreUpdate={() => recalcEcoScore(checkedActions, allActions)}
                onAddCustomAction={handleAddCustomAction}
              />
            </ErrorBoundary>
          </GlassCard>

          <GlassCard>
            <h3 className="font-headline-md text-xl font-bold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[24px]">model_training</span> Scenario Simulator
            </h3>
            <ErrorBoundary>
              <ScenarioSimulator
                inputs={inputs}
                persona={persona}
                result={result}
              />
            </ErrorBoundary>
          </GlassCard>

          <GlassCard>
            <h3 className="font-headline-md text-xl font-bold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[24px]">history</span> Carbon Time Machine
            </h3>
            <ErrorBoundary>
              <CarbonTimeMachine
                result={result}
                actions={allActions}
                checkedActions={checkedActions}
              />
            </ErrorBoundary>
          </GlassCard>

          <GlassCard>
            <h3 className="font-headline-md text-xl font-bold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[24px]">groups</span> Community Standing
            </h3>
            <ErrorBoundary>
              <LeaderboardPreview currentAnonymousId={anonymousId} />
            </ErrorBoundary>
          </GlassCard>

          <GlassCard className="md:col-span-2">
            <h3 className="font-headline-md text-xl font-bold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[24px]">card_membership</span> Shareable Impact Card
            </h3>
            <ErrorBoundary>
              <ImpactCard
                persona={persona}
                result={result}
                ecoScore={ecoScore}
                rank={userRank}
                totalUsers={totalUsers}
              />
            </ErrorBoundary>
          </GlassCard>
        </div>
      </div>

      <Footer />
    </main>
  );
}
