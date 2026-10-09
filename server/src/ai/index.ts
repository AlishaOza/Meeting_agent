import type { AiProvider } from "./ai.types";
import { geminiProvider } from "./providers/gemini.provider";
import { mockProvider } from "./providers/mock.provider";
export function getAiProvider(): AiProvider {
  const provider =
    process.env.AI_PROVIDER === "gemini" ? geminiProvider : mockProvider;


  return provider;
}