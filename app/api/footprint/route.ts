import { NextRequest, NextResponse } from "next/server";
import { saveFootprint, getFootprint } from "@/lib/supabase/footprintService";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json();
    const { anonymousId } = body;

    // Check that we have a user or a valid anonymous ID
    if (!user && (!anonymousId || typeof anonymousId !== "string")) {
      return NextResponse.json(
        { error: "anonymousId is required for guest saves" },
        { status: 400 }
      );
    }

    if (anonymousId) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(anonymousId)) {
        return NextResponse.json(
          { error: "Invalid anonymousId format" },
          { status: 400 }
        );
      }
    }

    const result = await saveFootprint({
      userId: user?.id ?? null,
      anonymousId: user ? null : anonymousId,
      personaId: body.personaId,
      totalKgCO2PerYear: body.totalKgCO2PerYear,
      breakdown: body.breakdown,
      severity: body.severity,
      topCategory: body.topCategory,
      comparisonToNationalAvg: body.comparisonToNationalAvg,
      comparisonToPersonaBaseline: body.comparisonToPersonaBaseline,
      actionsTaken: body.actionsTaken ?? [],
      ecoScore: body.ecoScore ?? 0,
      ecoLevel: body.ecoLevel ?? 1,
      streakDays: body.streakDays ?? 0,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error ?? "Failed to save footprint" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: result.id });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const anonymousId = request.nextUrl.searchParams.get("anonymous_id");

    if (!user && !anonymousId) {
      return NextResponse.json(
        { error: "anonymous_id query parameter or active user session is required" },
        { status: 400 }
      );
    }

    const result = await getFootprint(user ? null : anonymousId, user?.id ?? null);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    if (!result.data) {
      return NextResponse.json(
        { error: "Footprint not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result.data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
