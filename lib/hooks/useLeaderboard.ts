"use client";

import { useState, useEffect, useCallback } from "react";
import type { LeaderboardEntry, SortKey } from "@/types/leaderboard";
import type { User } from "@supabase/supabase-js";

const PER_PAGE = 50;

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

export function useLeaderboard(user: User | null, authLoading: boolean) {
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

  return {
    entries,
    totalCount,
    loading,
    error,
    sortKey,
    page,
    perPage: PER_PAGE,
    currentAnonymousId,
    userRankInfo,
    loadingMore,
    hasMore,
    handleSortChange,
    handleLoadMore,
    retry: () => fetchPage(page, sortKey, false),
  };
}
