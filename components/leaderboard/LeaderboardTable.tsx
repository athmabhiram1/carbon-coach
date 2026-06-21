import React from "react";
import Image from "next/image";
import { getPersonaIconComponent } from "@/lib/personas";
import { getLevelTitle } from "@/lib/scoring";
import { formatDate, formatTonnes } from "@/lib/format";
import { GlassCard } from "../ui/GlassCard";
import type { LeaderboardEntry } from "@/types/leaderboard";
import type { User } from "@supabase/supabase-js";

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  user: User | null;
  currentAnonymousId: string;
  page: number;
  perPage: number;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadingMore: boolean;
  userRankInfo: { rank: number; totalCount: number } | null;
  onLoadMore: () => void;
  onRetry: () => void;
}

function getStewardDetails(entry: LeaderboardEntry, isCurrentUser: boolean) {
  if (isCurrentUser) {
    return {
      name: "You (Steward)",
      region: entry.profiles?.region || "Local Region",
      avatar: entry.profiles?.avatar_url || "",
    };
  }

  if (entry.profiles && (entry.profiles.display_name || entry.profiles.avatar_url)) {
    return {
      name: entry.profiles.display_name || "Eco Warrior",
      region: entry.profiles.region || "Global",
      avatar: entry.profiles.avatar_url || "",
    };
  }

  return {
    name: "Anonymous Steward",
    region: "Global",
    avatar: "",
  };
}

export function LeaderboardTable({
  entries,
  user,
  currentAnonymousId,
  page,
  perPage,
  loading,
  error,
  hasMore,
  loadingMore,
  userRankInfo,
  onLoadMore,
  onRetry,
}: LeaderboardTableProps) {
  return (
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
            onClick={onRetry}
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
                const globalRank = page * perPage + i + 1;
                const isCurrentUser =
                  !!((user && entry.user_id === user.id) ||
                  (!user && entry.anonymous_id === currentAnonymousId));
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
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 shrink-0 flex items-center justify-center bg-primary/20 text-primary relative">
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
                      {formatTonnes(entry.total_kg_co2_per_year)}
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
            onClick={onLoadMore}
            disabled={loadingMore}
            className="rounded-full bg-surface-container-high/60 border border-white/10 text-on-surface px-8 py-3 text-xs font-semibold tracking-wider hover:bg-surface-bright/80 disabled:opacity-50 transition-all font-label-caps"
          >
            {loadingMore ? "LOADING..." : "LOAD MORE STEWARDS"}
          </button>
        </div>
      )}

      {userRankInfo && !entries.some(e => e.anonymous_id === currentAnonymousId) && (
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
  );
}
