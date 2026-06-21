"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getPersonaIconComponent } from "@/lib/personas";

interface LeaderboardPreviewProps {
  currentAnonymousId?: string;
}

interface Entry {
  anonymous_id: string;
  persona_id: string;
  eco_score: number;
  eco_level: number;
  total_kg_co2_per_year: number;
  created_at: string;
}

const STEWARD_NAMES = ["Elena R.", "Marcus G.", "Chloe W.", "Liam K.", "Yuki T.", "Sarah M.", "Oliver D.", "Amara L.", "Sophia V.", "Noah F.", "Lucas A.", "Mia H."];
const STEWARD_REGIONS = ["Nordic Region", "Pacific Coast", "Central Europe", "East Asia", "Eastern US", "Southern Australia", "British Isles", "West Africa", "Mediterranean"];
const STEWARD_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=100",
];

function getStewardDetails(anonymousId: string, isCurrentUser: boolean) {
  if (isCurrentUser) {
    return {
      name: "You (Steward)",
      region: "Local Region",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100"
    };
  }
  let hash = 0;
  for (let i = 0; i < anonymousId.length; i++) {
    hash = anonymousId.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);

  const name = STEWARD_NAMES[hash % STEWARD_NAMES.length];
  const region = STEWARD_REGIONS[hash % STEWARD_REGIONS.length];
  const avatar = STEWARD_AVATARS[hash % STEWARD_AVATARS.length];
  return { name, region, avatar };
}

export default function LeaderboardPreview({
  currentAnonymousId,
}: LeaderboardPreviewProps) {
  const [data, setData] = useState<Entry[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

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
          const isCurrentUser = entry.anonymous_id === currentAnonymousId;
          const { name, region, avatar } = getStewardDetails(entry.anonymous_id, isCurrentUser);
          const PersonaIcon = getPersonaIconComponent(entry.persona_id);
          
          return (
            <div
              key={entry.anonymous_id}
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
              
              <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 shrink-0">
                <img className="w-full h-full object-cover" src={avatar} alt={name} />
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


