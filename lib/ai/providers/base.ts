import type { AIProvider, Message } from "../types";

export abstract class BaseProvider implements AIProvider {
  protected maxRetries = 2;

  abstract generateResponse(context: string, history: Message[]): Promise<string>;

  abstract generateStreamResponse(
    context: string,
    history: Message[]
  ): AsyncGenerator<string, void, unknown>;

  protected async withRetry<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt < this.maxRetries) {
          await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
        }
      }
    }

    throw lastError ?? new Error("Unknown error after retries");
  }
}
