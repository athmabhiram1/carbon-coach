import { createServiceClient } from "@/lib/supabase/server";
import type { Database, Json } from "@/lib/supabase/types";
import type { ActionRecord } from "@/types/footprint";

export interface SaveFootprintData {
  userId?: string | null;
  anonymousId?: string | null;
  personaId: string;
  totalKgCO2PerYear: number;
  breakdown: { transport: number; diet: number; energy: number; shopping: number };
  severity: "excellent" | "good" | "average" | "high" | "critical";
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
    const supabase = createServiceClient();

    let existingId: string | undefined = undefined;

    if (data.userId) {
      const { data: existing } = (await supabase
        .from("footprints")
        .select("id")
        .eq("user_id", data.userId)
        .maybeSingle()) as unknown as { data: { id: string } | null };
      if (existing) existingId = existing.id;
    } else if (data.anonymousId) {
      const { data: existing } = (await supabase
        .from("footprints")
        .select("id")
        .eq("anonymous_id", data.anonymousId)
        .maybeSingle()) as unknown as { data: { id: string } | null };
      if (existing) existingId = existing.id;
    }

    const payload: Database["public"]["Tables"]["footprints"]["Insert"] = {
      user_id: data.userId || null,
      anonymous_id: data.userId ? null : (data.anonymousId || null),
      persona_id: data.personaId,
      total_kg_co2_per_year: data.totalKgCO2PerYear,
      breakdown: data.breakdown as unknown as Json,
      severity: data.severity,
      top_category: data.topCategory,
      comparison_to_national_avg: data.comparisonToNationalAvg,
      comparison_to_persona_baseline: data.comparisonToPersonaBaseline,
      actions_taken: data.actionsTaken as unknown as Json,
      eco_score: data.ecoScore,
      eco_level: data.ecoLevel,
      streak_days: data.streakDays,
    };

    if (existingId) {
      const { error } = await (supabase.from("footprints") as unknown as {
        update: (values: unknown) => { eq: (col: string, val: string) => Promise<{ error: { message: string } | null }> };
      })
        .update({
          ...payload,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingId);

      if (error) return { success: false, error: error.message };
      return { success: true, id: existingId };
    }

    const { data: inserted, error } = (await (supabase.from("footprints") as unknown as {
      insert: (values: unknown) => { select: (col: string) => { single: () => Promise<unknown> } };
    })
      .insert(payload)
      .select("id")
      .single()) as unknown as { data: { id: string } | null; error: { message: string } | null };

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
    const supabase = createServiceClient();
    
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
