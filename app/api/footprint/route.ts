import { NextRequest, NextResponse } from "next/server";
import {
  saveFootprint,
  getFootprint,
} from "@/lib/supabase/footprintService";

export const dynamic = "force-dynamic";


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { anonymousId } = body;

    if (!anonymousId || typeof anonymousId !== "string") {
      return NextResponse.json(
        { error: "anonymousId is required" },
        { status: 400 }
      );
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(anonymousId)) {
      return NextResponse.json(
        { error: "Invalid anonymousId format" },
        { status: 400 }
      );
    }

    const result = await saveFootprint({
      anonymousId,
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
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const anonymousId = request.nextUrl.searchParams.get("anonymous_id");

    if (!anonymousId) {
      return NextResponse.json(
        { error: "anonymous_id query parameter is required" },
        { status: 400 }
      );
    }

    const result = await getFootprint(anonymousId);

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
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
