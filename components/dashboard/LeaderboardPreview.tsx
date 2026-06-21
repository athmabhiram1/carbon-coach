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

const STEWARD_NAMES = [
  "Elena R.", "Marcus G.", "Chloe W.", "Liam K.", "Yuki T.", "Sarah M.", "Oliver D.", "Amara L.", 
  "Sophia V.", "Noah F.", "Lucas A.", "Mia H.", "Siddharth N.", "Fatima B.", "Mateo C.", "Aria S.", 
  "Leo M.", "Zoe P.", "Kai W.", "Freja L.", "Omar K.", "Hana E.", "Dmitri P.", "Chen W.", 
  "Maya J.", "Ethan B.", "Zara T.", "Aiden H.", "Lina M.", "Gabriel S.", "Priya K.", "Isaac N.", 
  "Emma D.", "Tariq A.", "Olivia C.", "Kaito S.", "Sofia G.", "Nour H.", "Lucas V.", "Amélie B."
];
const STEWARD_REGIONS = [
  "Nordic Region", "Pacific Coast", "Central Europe", "East Asia", "Eastern US", "Southern Australia", 
  "British Isles", "West Africa", "Mediterranean", "South America", "Northern Canada", "South Asia", "Middle East"
];
const STEWARD_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=100",
  "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=100",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=100",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=100",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=100",
  "https://images.unsplash.com/photo-1527983359383-4758693f760c?auto=format&fit=crop&q=80&w=100",
  "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=100",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=100",
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=100",
  "https://images.unsplash.com/photo-1507153079406-79f408500224?auto=format&fit=crop&q=80&w=100",
  "https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&q=80&w=100",
  "https://images.unsplash.com/photo-1504257400765-188ae795a76e?auto=format&fit=crop&q=80&w=100",
  "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=100",
  "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&q=80&w=100",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=100",
  "https://images.unsplash.com/photo-1500048993953-d23a436266cf?auto=format&fit=crop&q=80&w=100"
];

function getStewardDetails(isCurrentUser: boolean, index: number) {
  if (isCurrentUser) {
    return {
      name: "You (Steward)",
      region: "Local Region",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100"
    };
  }
  
  // Use index-based mapping with prime multipliers to guarantee uniqueness
  const nameIdx = (index * 7) % STEWARD_NAMES.length;
  const regionIdx = (index * 3) % STEWARD_REGIONS.length;
  const avatarIdx = (index * 11) % STEWARD_AVATARS.length;

  const name = STEWARD_NAMES[nameIdx];
  const region = STEWARD_REGIONS[regionIdx];
  const avatar = STEWARD_AVATARS[avatarIdx];
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
          const { name, region, avatar } = getStewardDetails(isCurrentUser, i + 1);
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


