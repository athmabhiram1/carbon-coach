import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { migrateAnonymousData } from "@/lib/supabase/migrateAnonymous";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const anonymousId = searchParams.get("anonymous_id");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.user && anonymousId) {
      // Migrate previous anonymous footprint data to this user account
      await migrateAnonymousData(anonymousId, data.user.id);
    }
  }

  // Redirect to dashboard
  return NextResponse.redirect(`${origin}${next}`);
}
