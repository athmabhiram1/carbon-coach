import { NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/supabase/footprintService";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const offset = Math.max(0, parseInt(url.searchParams.get("offset") ?? "0", 10));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") ?? "50", 10)));

    const result = await getLeaderboard(offset, limit);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      leaderboard: result.data ?? [],
      totalCount: result.totalCount ?? 0,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
