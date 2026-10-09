import { z } from "zod";
import { PRIORITY_LABELS, STATUS_LABELS } from "../utils/labels";
import { dateOnly } from "./meeting.validators";

const description = z
  .string()
  .trim()
  .min(1, "Task description is required.")
  .max(1000, "Description must be 1000 characters or fewer.");
const owner = z.string().trim().max(100, "Owner must be 100 characters or fewer.").nullable();

export const createActionSchema = z.object({
  description,
  owner: owner.optional(),
  dueDate: dateOnly.nullable().optional(),
  priority: z.enum(PRIORITY_LABELS).default("Medium"),
  status: z.enum(STATUS_LABELS).default("Open"),
});

export const updateActionSchema = z
  .object({
    description: description.optional(),
    owner: owner.optional(),
    dueDate: dateOnly.nullable().optional(),
    priority: z.enum(PRIORITY_LABELS).optional(),
    status: z.enum(STATUS_LABELS).optional(),
  })
  .refine((body) => Object.keys(body).length > 0, "Provide at least one field to update.");

export const actionQuerySchema = z.object({
  status: z.enum(STATUS_LABELS).optional(),
  priority: z.enum(PRIORITY_LABELS).optional(),
  owner: z.string().trim().max(100).optional(), 
  search: z.string().trim().max(100).optional(),
  meetingId: z.string().uuid().optional(),
  dueFrom: dateOnly.optional(),
  dueTo: dateOnly.optional(),
  overdue: z.literal("true").optional(),
});