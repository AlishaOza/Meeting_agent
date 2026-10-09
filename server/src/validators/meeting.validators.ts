import { z } from "zod";
import { isValidDateOnly } from "../utils/dates";

export const MEETING_TYPE_LABELS = [
  "Client Meeting",
  "Sales Meeting",
  "Project Meeting",
  "Internal Meeting",
  "Requirement Discussion",
  "Retrospective",
  "Other",
] as const;

export const dateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date (YYYY-MM-DD).")
  .refine(isValidDateOnly, "Enter a valid date.");

export const meetingBodySchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Meeting title is required.")
    .max(150, "Title must be 150 characters or fewer."),

  meetingDate: dateOnly,

  type: z.enum(MEETING_TYPE_LABELS),

  participants: z
    .array(
      z
        .string()
        .trim()
        .min(1, "Participant name cannot be empty.")
        .max(50, "Participant names must be 50 characters or fewer.")
    )
    .max(30, "A meeting can have at most 30 participants.")
    .default([]),

  transcript: z
    .string()
    .trim()
    .max(1_000_000, "Transcript is too large.")
    .default(""),
});

export const meetingListQuerySchema = z.object({
  search: z.string().trim().optional(),
});

export const notesBodySchema = z.object({
  notes: z.string().nullable(),
});

export const summaryBodySchema = z.object({
  summary: z.string().min(1, "Summary cannot be empty."),
});
