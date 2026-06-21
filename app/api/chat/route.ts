import { NextRequest, NextResponse } from "next/server";
import { GeminiProvider } from "@/lib/ai/providers/gemini";
import { OllamaProvider } from "@/lib/ai/providers/ollama";
import { buildSystemPrompt } from "@/lib/ai/promptBuilder";
import type { Message } from "@/lib/ai/types";
import type { Persona } from "@/lib/personas";
import type { FootprintResult } from "@/lib/carbonCalculator";

export const dynamic = "force-dynamic";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 60_000;

const OFFLINE_TIPS = [
  "Switch to LED bulbs and save ~100 kg CO2/year.",
  "Lower your thermostat by 1°C and save ~300 kg CO2/year.",
  "Reduce food waste and save ~200 kg CO2/year.",
  "Take shorter showers and save ~50 kg CO2/year.",
  "Use reusable bags and save ~5 kg CO2/year.",
  "Walk or bike for trips under 2 km instead of driving.",
  "Unplug electronics when not in use and save ~100 kg CO2/year.",
  "Eat one less meat meal per week and save ~150 kg CO2/year.",
];

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

interface ChatRequest {
  message: string;
  history: Message[];
  userInputs?: Record<string, unknown>;
  persona?: Persona;
  footprintResult?: FootprintResult;
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "127.0.0.1";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait before sending another message." },
        { status: 429 }
      );
    }

    const body: ChatRequest = await request.json();
    const { message, history, persona, footprintResult } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const systemPrompt =
      persona && footprintResult
        ? buildSystemPrompt(persona, footprintResult)
        : "You are EcoMind, a friendly carbon footprint coach.";

    const updatedHistory: Message[] = [
      ...(history ?? []),
      { role: "user", content: message },
    ];

    let provider;
    if (apiKey) {
      provider = new GeminiProvider(apiKey);
    } else {
      console.log("GEMINI_API_KEY not found. Using local Ollama provider for testing.");
      const host = process.env.OLLAMA_HOST || "http://127.0.0.1:11434";
      const modelName = process.env.OLLAMA_MODEL || "llama3";
      provider = new OllamaProvider(host, modelName);
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const generator = provider.generateStreamResponse(
            systemPrompt,
            updatedHistory
          );

          for await (const chunk of generator) {
            controller.enqueue(encoder.encode(chunk));
          }
        } catch {
          const fallback =
            "I'm having trouble connecting right now. Here's a quick tip: " +
            OFFLINE_TIPS[Math.floor(Math.random() * OFFLINE_TIPS.length)];
          controller.enqueue(encoder.encode(fallback));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch {
    return NextResponse.json(
      {
        error: "AI coach is temporarily unavailable. Here are some tips:",
        tips: OFFLINE_TIPS,
      },
      { status: 503 }
    );
  }
}
