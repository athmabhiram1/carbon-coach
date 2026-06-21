export interface Message {
  role: "user" | "model" | "system";
  content: string;
}

export interface AIProvider {
  generateResponse(context: string, history: Message[]): Promise<string>;
  generateStreamResponse(
    context: string,
    history: Message[]
  ): AsyncGenerator<string, void, unknown>;
}
