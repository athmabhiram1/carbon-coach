"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getPersonaIconComponent } from "@/lib/personas";
import { useAuth } from "@/lib/hooks/useAuth";
import type { LeaderboardEntry } from "@/lib/supabase/types";

interface LeaderboardPreviewProps {
  currentAnonymousId?: string;
}

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

export default function LeaderboardPreview({ currentAnonymousId }: LeaderboardPreviewProps) {
  const { user } = useAuth();
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const anonId = currentAnonymousId || (typeof window !== "undefined" ? localStorage.getItem("carbon-coach-anonymous-id") || "" : "");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch("/api/leaderboard");
        const json = await res.json();
        setData(json.leaderboard?.slice(0, 5) ?? []);
        setTotalCount(json.totalCount ?? 0);
      } catch {
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-xl bg-surface-container-high/50" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 font-body-base">
      <p className="text-sm text-on-surface-variant leading-relaxed">
        {totalCount > 0
          ? `See your position among ${totalCount.toLocaleString()} stewards tracking footprint reductions.`
          : "Join our community of eco stewards."}
      </p>

      <div className="space-y-2">
        {data.map((entry, i) => {
          const isCurrentUser = 
            (user && entry.user_id === user.id) || 
            (!user && entry.anonymous_id === anonId);
          const { name, region, avatar } = getStewardDetails(entry, isCurrentUser);
          const PersonaIcon = getPersonaIconComponent(entry.persona_id);
          
          return (
            <div
              key={entry.anonymous_id || entry.user_id || i}
              className={`flex items-center gap-3 rounded-xl px-4 py-2 text-sm border ${
                isCurrentUser
                  ? "bg-primary-container/10 border-primary/40 shadow-sm"
                  : "bg-surface-container-low/40 border-outline-variant/30"
              }`}
            >
              <span className="w-8 flex items-center justify-center font-data-metric text-on-surface-variant text-xs font-semibold">
                {i === 0 ? (
                  <span className="material-symbols-outlined text-yellow-500 text-[18px]">workspace_premium</span>
                ) : i === 1 ? (
                  <span className="material-symbols-outlined text-slate-300 text-[18px]">workspace_premium</span>
                ) : i === 2 ? (
                  <span className="material-symbols-outlined text-amber-600 text-[18px]">workspace_premium</span>
                ) : (
                  `#${i + 1}`
                )}
              </span>
              
              <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 shrink-0 flex items-center justify-center bg-primary/20 text-primary">
                {avatar ? (
                  <img className="w-full h-full object-cover" src={avatar} alt={name} />
                ) : (
                  <span className="material-symbols-outlined text-xs">eco</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-semibold text-on-surface text-xs truncate flex items-center gap-1.5">
                  {name}
                  <span className="text-on-surface-variant/80 shrink-0">
                    <PersonaIcon className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="text-[10px] text-on-surface-variant truncate">{region}</div>
              </div>

              <span className="font-data-metric text-xs font-bold text-primary">
                {entry.eco_score} pts
              </span>
            </div>
          );
        })}
      </div>

      <Link
        href="/leaderboard"
        className="mt-2 block w-full rounded-full bg-surface-container-highest border border-outline-variant/50 py-3 text-center text-xs font-semibold text-on-surface hover:bg-surface-bright/80 transition-all font-label-caps tracking-wider"
        aria-label="View full leaderboard"
      >
        VIEW FULL LEADERBOARD
      </Link>
    </div>
  );
}


