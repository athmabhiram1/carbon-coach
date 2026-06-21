import { createServiceClient } from "./server";

export async function migrateAnonymousData(anonymousId: string, userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServiceClient() as any;

    // Check if there is an existing anonymous footprint to migrate
    const { data: footprint, error: fetchError } = await supabase
      .from("footprints")
      .select("id")
      .eq("anonymous_id", anonymousId)
      .maybeSingle();

    if (fetchError) {
      return { success: false, error: fetchError.message };
    }

    if (!footprint) {
      // Nothing to migrate, user has no local footprint saved yet
      return { success: true };
    }

    // Migrate the footprint from anonymous_id to user_id
    const { error: updateError } = await supabase
      .from("footprints")
      .update({
        user_id: userId,
        anonymous_id: null,
        updated_at: new Date().toISOString()
      })
      .eq("anonymous_id", anonymousId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error in migration"
    };
  }
}
