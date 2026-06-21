"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { getPersonaIconComponent } from "@/lib/personas";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { GlassCard } from "@/components/ui/GlassCard";
import type { LeaderboardEntry } from "@/lib/supabase/types";
import { useAuth } from "@/lib/hooks/useAuth";

type SortKey = "eco_score" | "total_kg_co2_per_year" | "created_at";

const LEVEL_TITLES = ["Seedling", "Sprout", "Guardian", "Champion", "Planet Hero"];
const PER_PAGE = 50;

function getStewardDetails(entry: LeaderboardEntry, isCurrentUser: boolean) {
  if (isCurrentUser) {
    return {
      name: "You (Steward)",
      region: entry.profiles?.region || "Local Region",
      avatar: entry.profiles?.avatar_url || ""
    };
  }

  if (entry.profiles && (entry.profiles.display_name || entry.profiles.avatar_url)) {
    return {
      name: entry.profiles.display_name || "Eco Warrior",
      region: entry.profiles.region || "Global",
      avatar: entry.profiles.avatar_url || ""
    };
  }

  return {
    name: "Anonymous Steward",
    region: "Global",
    avatar: ""
  };
}

function getLevelTitle(level: number): string {
  return LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)] ?? "Seedling";
}



function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return dateStr;
  }
}

function formatCO2(kg: number): string {
  const tonnes = kg / 1000;
  return `${tonnes.toFixed(1)}t`;
}

const SORT_LABELS: Record<SortKey, string> = {
  eco_score: "EcoScore",
  total_kg_co2_per_year: "Total CO2",
  created_at: "Date",
};

export default function LeaderboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("eco_score");
  const [page, setPage] = useState(0);
  const [currentAnonymousId, setCurrentAnonymousId] = useState<string>("");
  const [userRankInfo, setUserRankInfo] = useState<{ rank: number; totalCount: number } | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const getAnonId = () => typeof window !== "undefined" ? localStorage.getItem("carbon-coach-anonymous-id") || "" : "";

  const fetchPage = useCallback(
    async (pageNum: number, sort: SortKey, append = false) => {
      try {
        if (append) setLoadingMore(true);
        else setLoading(true);
        setError(null);

        const offset = pageNum * PER_PAGE;
        const res = await fetch(`/api/leaderboard?offset=${offset}&limit=${PER_PAGE}&sort=${sort}`);
        if (!res.ok) throw new Error("Failed to fetch leaderboard");
        const json = await res.json();

        let sorted = [...(json.leaderboard ?? [])];
        if (sort === "total_kg_co2_per_year") {
          sorted.sort((a: LeaderboardEntry, b: LeaderboardEntry) => a.total_kg_co2_per_year - b.total_kg_co2_per_year);
        } else if (sort === "created_at") {
          sorted.sort((a: LeaderboardEntry, b: LeaderboardEntry) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        } else {
          sorted.sort((a: LeaderboardEntry, b: LeaderboardEntry) => b.eco_score - a.eco_score);
        }

        if (append) {
          setEntries((prev) => [...prev, ...sorted]);
        } else {
          setEntries(sorted);
        }
        setTotalCount(json.totalCount ?? 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Leaderboard temporarily unavailable");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  useEffect(() => {
    if (authLoading) return;
    const anon = getAnonId();
    setCurrentAnonymousId(anon);
    fetchPage(0, "eco_score", false);
  }, [authLoading, fetchPage]);

  useEffect(() => {
    if (authLoading || entries.length === 0) return;
    const anon = getAnonId();

    const inTop = entries.some((e) => 
      (user && e.user_id === user.id) || 
      (!user && e.anonymous_id === anon)
    );

    if (!inTop) {
      fetch(`/api/leaderboard?offset=0&limit=1`)
        .then((r) => r.json())
        .then((json) => {
          const total = json.totalCount ?? 0;
          fetchUserRank(anon, user?.id || null).then((rank) => {
            if (rank !== undefined) setUserRankInfo({ rank, totalCount: total });
          });
        })
        .catch(() => {});
    } else {
      setUserRankInfo(null);
    }
  }, [authLoading, user, entries]);

  const handleSortChange = (key: SortKey) => {
    setSortKey(key);
    setPage(0);
    fetchPage(0, key, false);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPage(nextPage, sortKey, true);
  };

  const hasMore = entries.length < totalCount;
  const currentUserEntry = entries.find((e) => e.anonymous_id === currentAnonymousId);

  return (
    <main className="min-h-screen bg-background relative overflow-x-hidden font-body-base flex flex-col justify-between" role="main">
      {/* Fixed Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div 
          className="w-full h-full bg-cover bg-center opacity-40 mix-blend-luminosity" 
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBrUNlExDcUZIh3XCXqcvrXzoeWQU4Zx6fKaCmhgDUNdMBYGzSxT15SZfbtr5uRgWf75tFH7KlJXEhzNeIrZforhqzE5u7j_FQMlYlivXlHpG48QbPy6TFbcdTYDlvDs7vC1xNjK-OZYhUNt9XvfG4FqZruZzX1Y_hcwByON2Z2oHlzK05b7XRN3FIE_OWpHocAhcVH2dYiriL9i8XPEMxSa6GbVkS-EHoz7nOyDshwXH7d4wKSrTCM_WGZ1CUXvGj9AH6PzrJ6TbgP')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
      </div>

      <Navbar />

      {/* Main Content */}
      <div className="relative z-10 pt-[140px] pb-section-gap px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full flex flex-col gap-8 flex-grow">
        
        {/* Header Section */}
        <header className="flex flex-col items-center text-center gap-4 fade-in-rise">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container-highest/50 backdrop-blur-md border border-white/5 shadow-md">
            <span className="font-label-caps text-label-caps text-primary tracking-widest uppercase text-[10px]">
              Global Standing
            </span>
          </div>
          <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface leading-none">
            Carbon Coach <span className="font-editorial-italic text-editorial-italic text-primary">Leaderboard</span>
          </h1>
          <p className="font-body-base text-body-base text-on-surface-variant max-w-2xl">
            See where you stand among our global community of stewards. Every reduction counts towards our collective future.
          </p>

          {/* Global Stat Chips */}
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-surface-container-high/40 backdrop-blur-md border border-white/5 shadow-lg">
              <span className="material-symbols-outlined text-tertiary text-2xl">groups</span>
              <div className="flex flex-col text-left">
                <span className="font-label-caps text-[9px] text-on-surface-variant uppercase tracking-wider">Total Stewards</span>
                <span className="font-data-metric text-lg text-on-surface font-bold">
                  {totalCount > 0 ? totalCount.toLocaleString() : "142,854"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-surface-container-high/40 backdrop-blur-md border border-white/5 shadow-lg">
              <span className="material-symbols-outlined text-tertiary text-2xl">co2</span>
              <div className="flex flex-col text-left">
                <span className="font-label-caps text-[9px] text-on-surface-variant uppercase tracking-wider">Avg Footprint</span>
                <span className="font-data-metric text-lg text-on-surface font-bold">
                  8.4 <span className="text-xs font-normal text-on-surface-variant">tCO2e</span>
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Filters and Sorting */}
        <section className="flex flex-col md:flex-row justify-between items-center gap-4 fade-in-rise delay-100 mt-4">
          <div className="flex items-center gap-2 bg-surface-container-high/40 backdrop-blur-xl p-1.5 rounded-full border border-white/5">
            <span className="px-6 py-2 text-primary font-body-base text-xs font-bold font-label-caps tracking-wider">
              GLOBAL STANDING
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-xs text-on-surface-variant font-label-caps tracking-wider uppercase font-semibold">Sort:</span>
            <div className="flex gap-2">
              {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => handleSortChange(key)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold font-label-caps tracking-wider transition-all border ${
                    sortKey === key
                      ? "bg-primary border-primary text-on-primary"
                      : "bg-surface-container-high/40 border-white/5 text-on-surface-variant hover:text-on-surface"
                  }`}
                  aria-pressed={sortKey === key}
                >
                  {SORT_LABELS[key].toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Leaderboard Table Grid using GlassCard */}
        <section className="fade-in-rise delay-200 mt-4">
          <GlassCard className="p-0">
            {loading && (
              <div className="p-8 space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded-xl bg-surface-container-high/50" />
                ))}
              </div>
            )}

            {error && !loading && (
              <div className="p-12 text-center flex flex-col items-center gap-4">
                <span className="material-symbols-outlined text-error text-4xl">error</span>
                <p className="text-on-surface-variant">{error}</p>
                <button
                  onClick={() => fetchPage(0, sortKey, false)}
                  className="rounded-full bg-primary text-on-primary px-6 py-2 text-xs font-bold tracking-wider font-label-caps hover:bg-primary-fixed transition-colors"
                >
                  RETRY LOADING
                </button>
              </div>
            )}

            {!loading && !error && entries.length === 0 && (
              <div className="p-16 text-center flex flex-col items-center gap-4">
                <span className="material-symbols-outlined text-primary text-[48px]">emoji_events</span>
                <p className="text-on-surface-variant">No stewards recorded yet. Start calculation to join!</p>
              </div>
            )}

            {!loading && !error && entries.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse" role="table">
                  <thead>
                    <tr className="border-b border-white/5 bg-surface-container-highest/20 text-xs font-label-caps text-on-surface-variant">
                      <th className="py-4 px-6 uppercase tracking-wider w-24">Rank</th>
                      <th className="py-4 px-6 uppercase tracking-wider">Steward</th>
                      <th className="py-4 px-6 uppercase tracking-wider hidden md:table-cell">EcoScore Level</th>
                      <th className="py-4 px-6 uppercase tracking-wider text-right">Annual Footprint</th>
                      <th className="py-4 px-6 uppercase tracking-wider text-right hidden lg:table-cell">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody className="font-body-base text-sm divide-y divide-white/5">
                    {entries.map((entry, i) => {
                      const globalRank = page * PER_PAGE + i + 1;
                      const isCurrentUser = 
                        (user && entry.user_id === user.id) || 
                        (!user && entry.anonymous_id === currentAnonymousId);
                      const { name, region, avatar } = getStewardDetails(entry, isCurrentUser);

                      return (
                        <tr
                          key={entry.anonymous_id || entry.user_id || i}
                          className={`hover:bg-surface-container-high/30 transition-colors group ${
                            isCurrentUser ? "bg-primary-container/10 border-l-2 border-primary" : ""
                          }`}
                        >
                          <td className="py-4 px-6">
                            {globalRank === 1 ? (
                              <div className="w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center font-bold border border-yellow-500/30">
                                <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
                              </div>
                            ) : globalRank === 2 ? (
                              <div className="w-8 h-8 rounded-full bg-slate-300/20 text-slate-300 flex items-center justify-center font-bold border border-slate-300/30">
                                <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
                              </div>
                            ) : globalRank === 3 ? (
                              <div className="w-8 h-8 rounded-full bg-amber-600/20 text-amber-600 flex items-center justify-center font-bold border border-amber-600/30">
                                <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
                              </div>
                            ) : (
                              <span className="font-data-metric text-on-surface-variant pl-2">#{globalRank}</span>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 shrink-0 flex items-center justify-center bg-primary/20 text-primary">
                                {avatar ? (
                                  <Image className="object-cover" src={avatar} alt={name} fill unoptimized />
                                ) : (
                                  <span className="material-symbols-outlined text-sm">eco</span>
                                )}
                              </div>
                              <div>
                                <div className="font-semibold text-on-surface flex items-center gap-1.5 text-xs">
                                  {name}
                                  {(() => {
                                    const PersonaIcon = getPersonaIconComponent(entry.persona_id);
                                    return <PersonaIcon className="w-3.5 h-3.5 text-on-surface-variant/80 shrink-0" />;
                                  })()}
                                </div>
                                <div className="text-[10px] text-on-surface-variant">{region}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 hidden md:table-cell">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
                              <span className="material-symbols-outlined text-[14px]">eco</span>
                              {getLevelTitle(entry.eco_level)} (Lv.{entry.eco_level})
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right font-data-metric font-semibold text-on-surface">
                            {formatCO2(entry.total_kg_co2_per_year)}
                          </td>
                          <td className="py-4 px-6 text-right hidden lg:table-cell text-xs text-on-surface-variant font-data-metric">
                            {formatDate(entry.created_at)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {hasMore && (
              <div className="py-6 border-t border-white/5 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="rounded-full bg-surface-container-high/60 border border-white/10 text-on-surface px-8 py-3 text-xs font-semibold tracking-wider hover:bg-surface-bright/80 disabled:opacity-50 transition-all font-label-caps"
                >
                  {loadingMore ? "LOADING..." : "LOAD MORE STEWARDS"}
                </button>
              </div>
            )}

            {userRankInfo && !currentUserEntry && (
              <div className="py-6 border-t border-white/5 text-center bg-surface-container-highest/10">
                <p className="text-sm text-on-surface-variant">
                  You are ranked <span className="font-bold text-primary font-data-metric">#{userRankInfo.rank}</span> out of{" "}
                  <span className="font-bold text-on-surface font-data-metric">{userRankInfo.totalCount.toLocaleString()}</span> stewards.
                </p>
                <p className="text-xs text-on-surface-variant/70 mt-1">
                  Log more eco-friendly actions to climb up the leaderboard!
                </p>
              </div>
            )}
          </GlassCard>
        </section>
      </div>

      <Footer />
    </main>
  );
}

async function fetchUserRank(anonymousId: string | null, userId: string | null): Promise<number | undefined> {
  try {
    const allRes = await fetch("/api/leaderboard?offset=0&limit=200");
    const allJson = await allRes.json();
    const allEntries: LeaderboardEntry[] = allJson.leaderboard ?? [];
    const idx = allEntries.findIndex((e) => 
      (userId && e.user_id === userId) || 
      (!userId && anonymousId && e.anonymous_id === anonymousId)
    );
    if (idx >= 0) return idx + 1;

    const idQuery = userId ? `?user_id=${userId}` : anonymousId ? `?anonymous_id=${encodeURIComponent(anonymousId)}` : "";
    if (!idQuery) return undefined;
    
    const selfRes = await fetch(`/api/footprint${idQuery}`);
    if (!selfRes.ok) return undefined;
    const selfJson = await selfRes.json();
    const userScore = selfJson.eco_score;
    if (userScore === undefined) return undefined;

    const aboveRes = await fetch("/api/leaderboard?offset=0&limit=500");
    const aboveJson = await aboveRes.json();
    const aboveEntries: LeaderboardEntry[] = aboveJson.leaderboard ?? [];
    const aboveCount = aboveEntries.filter((e) => e.eco_score > userScore).length;
    return aboveCount + 1;
  } catch {
    return undefined;
  }
}
