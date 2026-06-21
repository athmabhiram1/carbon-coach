import { GoogleGenAI } from "@google/genai";
import { BaseProvider } from "./base";
import type { Message } from "../types";

export class GeminiProvider extends BaseProvider {
  private ai: GoogleGenAI;
  private modelName: string;

  constructor(apiKey: string, modelName = "gemini-3.1-flash-lite") {
    super();
    this.ai = new GoogleGenAI({ apiKey });
    this.modelName = modelName;
  }

  private formatHistory(history: Message[]) {
    return history
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "model" ? "model" : "user" as const,
        parts: [{ text: m.content }],
      }));
  }

  async generateResponse(context: string, history: Message[]): Promise<string> {
    return this.withRetry(async () => {
      const formattedHistory = this.formatHistory(history);

      const chat = this.ai.chats.create({
        model: this.modelName,
        config: {
          systemInstruction: context,
          temperature: 0.7,
          maxOutputTokens: 800,
        },
        history: formattedHistory,
      });

      const lastMessage = history.filter((m) => m.role === "user").pop();
      const response = await chat.sendMessage({
        message: lastMessage?.content ?? "",
      });
      return response.text ?? "";
    });
  }

  async *generateStreamResponse(
    context: string,
    history: Message[]
  ): AsyncGenerator<string, void, unknown> {
    const formattedHistory = this.formatHistory(history);

    const chat = this.ai.chats.create({
      model: this.modelName,
      config: {
        systemInstruction: context,
        temperature: 0.7,
        maxOutputTokens: 800,
      },
      history: formattedHistory,
    });

    const lastMessage = history.filter((m) => m.role === "user").pop();
    const stream = await chat.sendMessageStream({
      message: lastMessage?.content ?? "",
    });

    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) {
        yield text;
      }
    }
  }
}
