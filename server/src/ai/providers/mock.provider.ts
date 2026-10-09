import type { AiProvider } from "../ai.types";

const ACTION = /\b(i will|i'll|we will|will send|will prepare|needs? to|action item|todo|to do)\b/i;
const DECISION = /\b(we decided|decided to|we agreed|agreed to|approved|let's go with)\b/i;
const RISK = /\b(risk|concern|blocker|blocked|worried|delay)\b/i;
const URGENT = /\b(urgent|asap|critical|immediately)\b/i;

const speaker = (line: string) => line.match(/^([A-Z][\w .'-]{0,40}):\s/)?.[1].trim() ?? null;
const content = (line: string) => line.replace(/^[A-Z][\w .'-]{0,40}:\s*/, "").trim();
const clip = (s: string, n = 200) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

export const mockProvider: AiProvider = {
  name: "mock",

  async analyze(input) {
    await new Promise((r) => setTimeout(r, 1200)); 

    const lines = input.transcript.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const actionLines = lines.filter((l) => ACTION.test(l)).slice(0, 8);
    const decisions = lines.filter((l) => DECISION.test(l)).map((l) => clip(content(l))).slice(0, 5);

    return JSON.stringify({
      summary: `[Demo analysis - mock AI provider] "${input.title}" (${input.type}) has ${lines.length} transcript lines. Switch AI_PROVIDER to gemini for a real summary.`,
      purpose: `Discussion for "${input.title}".`,
      keyPoints: lines.filter((l) => !l.endsWith("?")).slice(0, 5).map((l) => clip(content(l))),
      outcomes: decisions.slice(0, 3),
      risks: lines.filter((l) => RISK.test(l)).slice(0, 4).map((l) => clip(content(l))),
      nextSteps: actionLines.slice(0, 3).map((l) => clip(content(l))),
      decisions,
      openQuestions: lines.filter((l) => l.endsWith("?")).slice(0, 5).map((l) => clip(content(l))),
      actionItems: actionLines.map((l) => ({
        description: clip(content(l), 300),
        owner: speaker(l),
        dueDate: null,
        priority: URGENT.test(l) ? "High" : "Medium",
        status: "Open",
      })),
    });
  },
};