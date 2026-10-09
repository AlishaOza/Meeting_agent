import {
  ActionStatus,
  MeetingType,
  Priority,
} from "@prisma/client";


export const PRIORITY_LABELS = ["Low", "Medium", "High"] as const;

export const STATUS_LABELS = [
  "Open",
  "In Progress",
  "Blocked",
  "Completed",
] as const;
export const LABEL_BY_TYPE: Record<MeetingType, string> = {
  CLIENT: "Client Meeting",
  SALES: "Sales Meeting",
  PROJECT: "Project Meeting",
  INTERNAL: "Internal Meeting",
  REQUIREMENT: "Requirement Discussion",
  RETROSPECTIVE: "Retrospective",
  OTHER: "Other",
};

export const TYPE_BY_LABEL: Record<string, MeetingType> = {
  "Client Meeting": "CLIENT",
  "Sales Meeting": "SALES",
  "Project Meeting": "PROJECT",
  "Internal Meeting": "INTERNAL",
  "Requirement Discussion": "REQUIREMENT",
  Retrospective: "RETROSPECTIVE",
  Other: "OTHER",
};

export const LABEL_BY_PRIORITY: Record<Priority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

export const PRIORITY_BY_LABEL: Record<
  "Low" | "Medium" | "High",
  Priority
> = {
  Low: "LOW",
  Medium: "MEDIUM",
  High: "HIGH",
};

export const LABEL_BY_STATUS: Record<ActionStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  BLOCKED: "Blocked",
  COMPLETED: "Completed",
};

export const STATUS_BY_LABEL: Record<
  "Open" | "In Progress" | "Blocked" | "Completed",
  ActionStatus
> = {
  Open: "OPEN",
  "In Progress": "IN_PROGRESS",
  Blocked: "BLOCKED",
  Completed: "COMPLETED",
};