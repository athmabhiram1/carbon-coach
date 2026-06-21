import { BaseProvider } from "./base";
import type { Message } from "../types";

export class OllamaProvider extends BaseProvider {
  private host: string;
  private modelName: string;

  constructor(host = process.env.OLLAMA_HOST || "http://127.0.0.1:11434", modelName = process.env.OLLAMA_MODEL || "llama3") {
    super();
    this.host = host;
    this.modelName = modelName;
  }

  private formatMessages(context: string, history: Message[]) {
    return [
      { role: "system", content: context },
      ...history.map((m) => ({
        role: m.role === "model" ? "assistant" : "user",
        content: m.content,
      })),
    ];
  }

  async generateResponse(context: string, history: Message[]): Promise<string> {
    return this.withRetry(async () => {
      const messages = this.formatMessages(context, history);
      const res = await fetch(`${this.host}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: this.modelName,
          messages,
          stream: false,
        }),
      });

      if (!res.ok) {
        throw new Error(`Ollama request failed: ${res.statusText}`);
      }

      const data = await res.json();
      return data.message?.content ?? "";
    });
  }

  async *generateStreamResponse(
    context: string,
    history: Message[]
  ): AsyncGenerator<string, void, unknown> {
    const messages = this.formatMessages(context, history);
    const res = await fetch(`${this.host}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.modelName,
        messages,
        stream: true,
      }),
    });

    if (!res.ok) {
      throw new Error(`Ollama request failed: ${res.statusText}`);
    }

    const reader = res.body?.getReader();
    if (!reader) return;

    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const json = JSON.parse(line);
            const content = json.message?.content;
            if (content) {
              yield content;
            }
          } catch {
            // Ignore parsing errors on incomplete lines
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}
