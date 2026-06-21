import { createClient } from "./server";
import type { ActionRecord, LeaderboardEntry } from "./types";

interface SaveFootprintData {
  anonymousId: string;
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
    const supabase = createClient();

    const { data: existing } = await supabase
      .from("footprints")
      .select("id")
      .eq("anonymous_id", data.anonymousId)
      .limit(1)
      .single();

    const payload = {
      anonymous_id: data.anonymousId,
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

    if (existing) {
      const { error } = await supabase
        .from("footprints")
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq("anonymous_id", data.anonymousId);

      if (error) return { success: false, error: error.message };
      return { success: true, id: existing.id };
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

export async function getFootprint(anonymousId: string) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("footprints")
      .select("*")
      .eq("anonymous_id", anonymousId)
      .maybeSingle();

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
  limit = 50
) {
  try {
    const supabase = createClient();

    const from = offset;
    const to = offset + limit - 1;

    const { data, error } = await supabase
      .from("footprints")
      .select(
        "anonymous_id, persona_id, eco_score, eco_level, total_kg_co2_per_year, created_at"
      )
      .order("eco_score", { ascending: false })
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

export async function getUserRank(anonymousId: string) {
  try {
    const supabase = createClient();

    const { count, error: countError } = await supabase
      .from("footprints")
      .select("*", { count: "exact", head: true });

    if (countError) return { error: countError.message };
    const totalCount = count ?? 0;

    const { data: userFootprint } = await supabase
      .from("footprints")
      .select("eco_score")
      .eq("anonymous_id", anonymousId)
      .maybeSingle();

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
