import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { buildActionSuggestionPrompt } from "@/lib/ai/promptBuilder";
import type { Persona } from "@/lib/personas";
import type { FootprintResult } from "@/lib/carbonCalculator";
import type { Action } from "@/lib/timeMachine";

export const dynamic = "force-dynamic";

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
