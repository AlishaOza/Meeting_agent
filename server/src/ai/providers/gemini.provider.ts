import { env } from "../../config/env";
import { logger } from "../../utils/logger";
import { AiServiceError, type AiProvider } from "../ai.types";
import { buildUserPrompt, SYSTEM_PROMPT } from "../prompt";

const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";

export const geminiProvider: AiProvider = {
  name: "gemini",

  async analyze(input) {
    let res: Response;
    try {
      res = await fetch(`${ENDPOINT}/${env.GEMINI_MODEL}:generateContent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": env.GEMINI_API_KEY as string, 
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: "user", parts: [{ text: buildUserPrompt(input) }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 8192,
            responseMimeType: "application/json",
          },
        }),
        signal: AbortSignal.timeout(env.AI_TIMEOUT_MS),
      });
    } catch (err) {
      const timedOut = err instanceof Error && err.name === "TimeoutError";
      logger.error("Gemini request failed", err);
      throw new AiServiceError(
        timedOut
          ? "The AI took too long to respond. Please try again."
          : "Could not reach the AI service. Please try again."
      );
    }

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      logger.error(`Gemini returned HTTP ${res.status}`, body.slice(0, 500));
      if (res.status === 429) {
        throw new AiServiceError("The AI service is busy right now. Please try again in a minute.");
      }
      if (res.status >= 500) {
        throw new AiServiceError("The AI service is temporarily unavailable. Please try again.");
      }
      throw new AiServiceError("The AI service rejected the request. Please contact the administrator.");
    }

    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";

    if (!text.trim()) {
      logger.warn("Gemini returned no text (possibly blocked by safety filters)");
      throw new AiServiceError("The AI did not return a result for this transcript. Please try again.");
    }
    return text;
  },
};