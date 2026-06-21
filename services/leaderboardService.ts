import { createServiceClient } from "@/lib/supabase/server";
import type { LeaderboardEntry, SortKey } from "@/types/leaderboard";

export async function getLeaderboard(
  offset = 0,
  limit = 50,
  sortBy: SortKey = "eco_score"
): Promise<{ data?: LeaderboardEntry[]; totalCount?: number; error?: string }> {
  try {
    const supabase = createServiceClient();

    const from = offset;
    const to = offset + limit - 1;

    let orderColumn = "eco_score";
    let ascending = false;

    if (sortBy === "total_kg_co2_per_year") {
      orderColumn = "total_kg_co2_per_year";
      ascending = true;
    } else if (sortBy === "created_at") {
      orderColumn = "created_at";
      ascending = false;
    }

    // Fetch footprints joined with profiles table, fallback to footprints-only if relation or columns do not exist
    let data: any[] | null = null;
    let error: any = null;

    try {
      const result = await supabase
        .from("footprints")
        .select(`
          anonymous_id,
          user_id,
          persona_id,
          eco_score,
          eco_level,
          total_kg_co2_per_year,
          created_at,
          profiles:user_id (
            display_name,
            avatar_url,
            region
          )
        `)
        .order(orderColumn, { ascending })
        .range(from, to);
      data = result.data;
      error = result.error;
    } catch (e) {
      error = e;
    }

    if (error || !data) {
      console.warn("Leaderboard join query failed. Falling back to footprints-only. Error:", error);
      const fallbackResult = await supabase
        .from("footprints")
        .select(`
          anonymous_id,
          persona_id,
          eco_score,
          eco_level,
          total_kg_co2_per_year,
          created_at
        `)
        .order(orderColumn, { ascending })
        .range(from, to);

      if (fallbackResult.error) return { error: fallbackResult.error.message };
      data = fallbackResult.data;
    }

    const { count, error: countError } = await supabase
      .from("footprints")
      .select("*", { count: "exact", head: true });

    const typedData = (data ?? []).map((item) => {
      const row = item as unknown as {
        anonymous_id: string | null;
        user_id?: string | null;
        persona_id: string;
        eco_score: number;
        eco_level: number;
        total_kg_co2_per_year: number;
        created_at: string;
        profiles?: {
          display_name: string | null;
          avatar_url: string | null;
          region: string;
        } | null;
      };
      return {
        anonymous_id: row.anonymous_id,
        user_id: row.user_id || null,
        persona_id: row.persona_id,
        eco_score: row.eco_score,
        eco_level: row.eco_level,
        total_kg_co2_per_year: row.total_kg_co2_per_year,
        created_at: row.created_at,
        profiles: row.profiles ? {
          display_name: row.profiles.display_name,
          avatar_url: row.profiles.avatar_url,
          region: row.profiles.region,
        } : null,
      };
    });

    return {
      data: typedData,
      totalCount: countError ? undefined : (count ?? 0),
    };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export async function getUserRank(
  anonymousId?: string | null,
  userId?: string | null
): Promise<{ rank?: number; totalCount?: number; error?: string }> {
  try {
    const supabase = createServiceClient();

    const { count, error: countError } = await supabase
      .from("footprints")
      .select("*", { count: "exact", head: true });

    if (countError) return { error: countError.message };
    const totalCount = count ?? 0;

    let userFootprint: { eco_score: number } | null = null;

    if (userId) {
      try {
        const { data, error } = await supabase
          .from("footprints")
          .select("eco_score")
          .eq("user_id", userId)
          .maybeSingle();
        if (!error && data) {
          userFootprint = data as { eco_score: number };
        }
      } catch {
        // Fallback to anonymousId
      }
    }

    if (!userFootprint && anonymousId) {
      try {
        const { data, error } = await supabase
          .from("footprints")
          .select("eco_score")
          .eq("anonymous_id", anonymousId)
          .maybeSingle();
        if (!error && data) {
          userFootprint = data as { eco_score: number };
        }
      } catch {
        // Ignore
      }
    }

    if (!userFootprint) {
      return { rank: undefined, totalCount };
    }

    const { data: above, error: aboveError } = (await supabase
      .from("footprints")
      .select("id")
      .gt("eco_score", userFootprint.eco_score)) as unknown as { data: { id: string }[] | null; error: { message: string } | null };

    if (aboveError) return { error: aboveError.message };
    const rank = (above?.length ?? 0) + 1;

    return { rank, totalCount };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
