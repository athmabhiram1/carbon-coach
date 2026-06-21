"use client";

import { useState, useRef, useEffect } from "react";
import type { Message } from "@/lib/ai/types";
import type { Persona } from "@/lib/personas";
import type { FootprintResult } from "@/lib/carbonCalculator";
import type { Action } from "@/lib/timeMachine";

interface AICoachProps {
  persona: Persona;
  result: FootprintResult;
  existingActions?: Action[];
  onActionsSuggested?: (actions: Action[]) => void;
}

const OFFLINE_TIPS = [
  "Switch to LED bulbs and save ~100 kg CO₂/year.",
  "Lower your thermostat by 1°C and save ~300 kg CO₂/year.",
  "Reduce food waste and save ~200 kg CO₂/year.",
  "Walk or bike for trips under 2 km instead of driving.",
  "Eat one less meat meal per week and save ~150 kg CO₂/year.",
];

export default function AICoach({ persona, result, existingActions, onActionsSuggested }: AICoachProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true);
    }
  }, [persona, result, isInitialized]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const totalTonnes = (result.totalKgCO2PerYear / 1000).toFixed(1);

  const sendMessage = async (content: string) => {
    const newMessages: Message[] = [
      ...messages,
      { role: "user", content },
    ];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          history: messages,
          persona,
          footprintResult: result,
        }),
      });

      if (!res.ok) {
        const tip = OFFLINE_TIPS[Math.floor(Math.random() * OFFLINE_TIPS.length)];
        setMessages((prev) => [
          ...prev,
          { role: "model", content: `Eco Tip: ${tip}` },
        ]);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let aiContent = "";

      setMessages((prev) => [...prev, { role: "model", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        aiContent += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "model", content: aiContent };
          return updated;
        });
      }
    } catch {
      const tip = OFFLINE_TIPS[Math.floor(Math.random() * OFFLINE_TIPS.length)];
      setMessages((prev) => [
        ...prev,
        { role: "model", content: `Eco Tip: ${tip}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
  };

  const handleSuggestActions = async () => {
    if (isSuggesting) return;
    setIsSuggesting(true);

    try {
      const res = await fetch("/api/chat/suggest-actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          persona,
          footprintResult: result,
          existingActions: existingActions ?? [],
        }),
      });

      if (!res.ok) return;

      const data = await res.json();
      const suggestions: { label: string; savingsKg: number; reasoning: string }[] = data.suggestions ?? [];

      if (suggestions.length > 0 && onActionsSuggested) {
        const actions: Action[] = suggestions.map((s) => ({
          id: `ai-suggested-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          label: s.label,
          savingsKg: s.savingsKg,
        }));
        onActionsSuggested(actions);

        const suggestionsList = suggestions
          .map((s) => `• ${s.label} (-${s.savingsKg} kg/yr)`)
          .join("\n");

        setMessages((prev) => [
          ...prev,
          {
            role: "model",
            content: `Based on your profile, here are some actions I suggest:\n\n${suggestionsList}\n\nI've added these to your Action Tracker — check them off as you go!`,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "model",
            content: "I wasn't able to generate suggestions right now. Try adding a custom action manually from the Action Tracker.",
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content: "Having trouble connecting. Please try again.",
        },
      ]);
    } finally {
      setIsSuggesting(false);
    }
  };

  const proactiveMessage = `Hi! I'm EcoMind, your AI Carbon Coach. I see your annual footprint is estimated at ${totalTonnes} tons of CO₂. Your main category is ${result.topCategory.toUpperCase()}. How can I help you reduce your daily impact?`;

  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.5)] min-h-[360px] fade-in-rise">
      <div className="flex justify-between items-center mb-6">
        <span className="bg-primary/10 text-primary font-label-caps text-label-caps px-3 py-1 rounded-full flex items-center gap-2 text-[10px] tracking-wider uppercase">
          <span className="material-symbols-outlined text-[14px]">psychology</span>
          ECOMIND AI
        </span>
        {onActionsSuggested && (
          <button
            onClick={handleSuggestActions}
            disabled={isSuggesting}
            className="bg-secondary-container/30 text-secondary text-[10px] font-label-caps tracking-wider px-3 py-1.5 rounded-full hover:bg-secondary-container/50 transition-all flex items-center gap-1.5 disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
            {isSuggesting ? "Thinking..." : "Suggest Actions"}
          </button>
        )}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto mb-4 pr-2 max-h-[220px]">
        {messages.length === 0 && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary text-[18px]">eco</span>
            </div>
            <div className="bg-surface-container-high/60 p-4 rounded-2xl rounded-tl-none border border-outline-variant/20 max-w-[80%]">
              <p className="text-sm text-on-surface">{proactiveMessage}</p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => {
          const isUser = msg.role === "user";
          return (
            <div key={i} className={`flex gap-4 ${isUser ? "flex-row-reverse" : "justify-start"}`}>
              {!isUser && (
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary text-[18px]">eco</span>
                </div>
              )}
              <div 
                className={`p-4 rounded-2xl border max-w-[80%] text-sm text-on-surface whitespace-pre-wrap ${
                  isUser
                    ? "bg-secondary-container/40 rounded-tr-none border-outline-variant/20"
                    : "bg-surface-container-high/60 rounded-tl-none border-outline-variant/20"
                }`}
              >
                <p>{msg.content}</p>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-on-surface-variant animate-pulse ml-12">
            <span className="h-2 w-2 rounded-full bg-primary" />
            Coaching...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Form */}
      <form onSubmit={handleSubmit} className="relative mt-auto">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about reducing your impact..."
          className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-full py-3.5 pl-6 pr-14 text-sm focus:ring-1 focus:ring-primary focus:border-primary text-on-surface placeholder:text-on-surface-variant/50 backdrop-blur-sm outline-none transition-all"
          disabled={isLoading}
          aria-label="Ask about reducing your impact"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-primary flex items-center justify-center text-on-primary hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          aria-label="Send message"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
        </button>
      </form>
    </div>
  );
}
