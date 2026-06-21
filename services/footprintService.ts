import { createServiceClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";
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
      try {
        const { data: existing } = (await supabase
          .from("footprints")
          .select("id")
          .eq("user_id", data.userId)
          .maybeSingle()) as unknown as { data: { id: string } | null };
        if (existing) existingId = existing.id;
      } catch {
        // Fallback to anonymousId check if user_id column doesn't exist
      }
    }

    if (!existingId && data.anonymousId) {
      try {
        const { data: existing } = (await supabase
          .from("footprints")
          .select("id")
          .eq("anonymous_id", data.anonymousId)
          .maybeSingle()) as unknown as { data: { id: string } | null };
        if (existing) existingId = existing.id;
      } catch {
        // Ignore
      }
    }

    const payload: Record<string, any> = {
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

    const trySave = async (payloadData: Record<string, any>): Promise<any> => {
      if (existingId) {
        return await (supabase.from("footprints") as any)
          .update({
            ...payloadData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingId);
      } else {
        return await (supabase.from("footprints") as any)
          .insert(payloadData)
          .select("id")
          .single();
      }
    };

    let result = await trySave(payload);

    // If saving fails due to missing user_id column, strip user_id and retry
    if (result.error && (result.error.message.includes("user_id") || result.error.message.includes("column"))) {
      console.warn("Retrying footprint save without user_id column...");
      const strippedPayload = { ...payload };
      delete strippedPayload.user_id;
      if (data.anonymousId) {
        strippedPayload.anonymous_id = data.anonymousId;
      }
      result = await trySave(strippedPayload);
    }

    if (result.error) return { success: false, error: result.error.message };
    const insertedId = (result as any).data?.id || existingId;
    return { success: true, id: insertedId };
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
    
    if (userId) {
      try {
        const { data, error } = await supabase
          .from("footprints")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();
        if (!error && data) {
          return { data: data ?? undefined };
        }
      } catch {
        // Fallback to anonymousId
      }
    }
    
    if (anonymousId) {
      const { data, error } = await supabase
        .from("footprints")
        .select("*")
        .eq("anonymous_id", anonymousId)
        .maybeSingle();
      if (error) return { error: error.message };
      return { data: data ?? undefined };
    }

    return { error: "Either user_id or anonymous_id must be provided" };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
