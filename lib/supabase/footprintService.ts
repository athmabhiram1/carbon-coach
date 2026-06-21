import { createServiceClient } from "./server";
import type { ActionRecord, LeaderboardEntry } from "./types";

interface SaveFootprintData {
  userId?: string | null;
  anonymousId?: string | null;
  personaId: string;
  totalKgCO2PerYear: number;
  breakdown: { transport: number; diet: number; energy: number; shopping: number };
  severity: string;
  topCategory: string;
  comparisonToNationalAvg: number;
  comparisonToPersonaBaseline: number;
  actionsTaken: ActionRecord[];
  ecoScore: number;
  ecoLevel: number;
  streakDays: number;
}

export async function saveFootprint(
  data: SaveFootprintData
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    // Use service client to ensure upsert goes through RLS correctly
    const supabase = createServiceClient() as any;

    let existingId: string | undefined = undefined;

    if (data.userId) {
      const { data: existing } = await supabase
        .from("footprints")
        .select("id")
        .eq("user_id", data.userId)
        .maybeSingle() as any;
      if (existing) existingId = existing.id;
    } else if (data.anonymousId) {
      const { data: existing } = await supabase
        .from("footprints")
        .select("id")
        .eq("anonymous_id", data.anonymousId)
        .maybeSingle() as any;
      if (existing) existingId = existing.id;
    }

    const payload = {
      user_id: data.userId || null,
      anonymous_id: data.userId ? null : (data.anonymousId || null),
      persona_id: data.personaId,
      total_kg_co2_per_year: data.totalKgCO2PerYear,
      breakdown: data.breakdown,
      severity: data.severity,
      top_category: data.topCategory,
      comparison_to_national_avg: data.comparisonToNationalAvg,
      comparison_to_persona_baseline: data.comparisonToPersonaBaseline,
      actions_taken: data.actionsTaken,
      eco_score: data.ecoScore,
      eco_level: data.ecoLevel,
      streak_days: data.streakDays,
    };

    if (existingId) {
      const { error } = await supabase
        .from("footprints")
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq("id", existingId);

      if (error) return { success: false, error: error.message };
      return { success: true, id: existingId };
    }

    const { data: inserted, error } = await supabase
      .from("footprints")
      .insert(payload)
      .select("id")
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, id: inserted?.id };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export async function getFootprint(anonymousId?: string | null, userId?: string | null) {
  try {
    const supabase = createServiceClient() as any;
    
    let query = supabase.from("footprints").select("*");
    
    if (userId) {
      query = query.eq("user_id", userId);
    } else if (anonymousId) {
      query = query.eq("anonymous_id", anonymousId);
    } else {
      return { error: "Either user_id or anonymous_id must be provided" };
    }

    const { data, error } = await query.maybeSingle();

    if (error) return { error: error.message };
    return { data: data ?? undefined };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export async function getLeaderboard(
  offset = 0,
  limit = 50,
  sortBy: "eco_score" | "total_kg_co2_per_year" | "created_at" = "eco_score"
) {
  try {
    const supabase = createServiceClient() as any;

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

    // Fetch footprints joined with profiles table
    const { data, error } = await supabase
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

    const { count, error: countError } = await supabase
      .from("footprints")
      .select("*", { count: "exact", head: true });

    if (error) return { error: error.message };
    return {
      data: data as unknown as LeaderboardEntry[],
      totalCount: countError ? undefined : (count ?? 0),
    };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export async function getUserRank(anonymousId?: string | null, userId?: string | null) {
  try {
    const supabase = createServiceClient() as any;

    const { count, error: countError } = await supabase
      .from("footprints")
      .select("*", { count: "exact", head: true });

    if (countError) return { error: countError.message };
    const totalCount = count ?? 0;

    let userQuery = supabase.from("footprints").select("eco_score");
    if (userId) {
      userQuery = userQuery.eq("user_id", userId);
    } else if (anonymousId) {
      userQuery = userQuery.eq("anonymous_id", anonymousId);
    } else {
      return { rank: undefined, totalCount };
    }

    const { data: userFootprint } = await userQuery.maybeSingle();

    if (!userFootprint) {
      return { rank: undefined, totalCount };
    }

    const { data: above, error: aboveError } = await supabase
      .from("footprints")
      .select("id")
      .gt("eco_score", userFootprint.eco_score);

    if (aboveError) return { error: aboveError.message };
    const rank = (above?.length ?? 0) + 1;

    return { rank, totalCount };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
