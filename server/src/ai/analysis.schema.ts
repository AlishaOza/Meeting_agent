import { z } from "zod";

export const analysisActionItemSchema = z.object({
  description: z.string().min(1),
  owner: z.string().nullable().default(null),
  dueDate: z.string().nullable().default(null),
  priority: z.enum(["Low", "Medium", "High"]).default("Medium"),
  status: z
    .enum(["Open", "In Progress", "Blocked", "Completed"])
    .default("Open"),
});

export const analysisSchema = z.object({
  summary: z.string().default(""),
  purpose: z.string().default(""),
  keyPoints: z.array(z.string()).default([]),
  outcomes: z.array(z.string()).default([]),
  decisions: z.array(z.string()).default([]),
  risks: z.array(z.string()).default([]),
  nextSteps: z.array(z.string()).default([]),
  openQuestions: z.array(z.string()).default([]),
  actionItems: z.array(analysisActionItemSchema).default([]),
});

export type MeetingAnalysis = z.infer<typeof analysisSchema>;
export type AnalysisActionItem = z.infer<typeof analysisActionItemSchema>;