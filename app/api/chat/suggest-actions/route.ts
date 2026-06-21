import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { buildActionSuggestionPrompt } from "@/lib/ai/promptBuilder";
import type { Persona } from "@/lib/personas";
import type { FootprintResult } from "@/lib/carbonCalculator";
import type { Action } from "@/lib/timeMachine";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

interface SuggestActionsRequest {
  persona: Persona;
  footprintResult: FootprintResult;
  existingActions: Action[];
}

interface SuggestedAction {
  label: string;
  savingsKg: number;
  reasoning: string;
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "127.0.0.1";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait." },
        { status: 429 }
      );
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const hasAnonymousId = request.cookies.has("carbon-coach-anonymous-id");

    if (!user && !hasAnonymousId) {
      return NextResponse.json(
        { error: "Unauthorized session" },
        { status: 401 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI not configured" },
        { status: 503 }
      );
    }

    const body: SuggestActionsRequest = await request.json();
    const { persona, footprintResult, existingActions } = body;

    if (!persona || !footprintResult) {
      return NextResponse.json(
        { error: "Persona and footprint result are required" },
        { status: 400 }
      );
    }

    const prompt = buildActionSuggestionPrompt(
      persona,
      footprintResult,
      existingActions
    );

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        temperature: 0.4,
        maxOutputTokens: 1024,
      },
    });

    const text = response.text ?? "";
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const jsonStr = jsonMatch ? jsonMatch[0] : text;

    let suggestions: SuggestedAction[];
    try {
      suggestions = JSON.parse(jsonStr);
    } catch {
      suggestions = [];
    }

    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json(
      { suggestions: [] },
      { status: 200 }
    );
  }
}
