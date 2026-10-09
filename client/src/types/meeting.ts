export const MEETING_TYPES = [
  "Client Meeting",
  "Sales Meeting",
  "Project Meeting",
  "Internal Meeting",
  "Requirement Discussion",
  "Retrospective",
  "Other",
] as const;

export type MeetingType = (typeof MEETING_TYPES)[number];

export const ACTION_STATUSES = [
  "Open",
  "In Progress",
  "Blocked",
  "Completed",
] as const;

export const ACTION_PRIORITIES = ["Low", "Medium", "High"] as const;

export type ActionStatus = (typeof ACTION_STATUSES)[number];
export type ActionPriority = (typeof ACTION_PRIORITIES)[number];

export type AiStatus =
  | "NOT_STARTED"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";

export interface CreateMeetingPayload {
  title: string;
  meetingDate: string;
  type: MeetingType;
  participants: string[];
  transcript: string;
}

export interface Meeting extends CreateMeetingPayload {
  id: string;
  notes: string | null;

  aiStatus: AiStatus;
  aiError: string | null;
  aiProcessedAt: string | null;

  summary: string | null;
  purpose: string | null;

  keyPoints: string[];
  outcomes: string[];
  decisions: string[];
  risks: string[];
  nextSteps: string[];
  openQuestions: string[];

  createdAt: string;
  updatedAt: string;
}

export interface MeetingDetail extends Meeting {}

export interface ActionItem {
  id: string;
  meetingId: string;
  meetingTitle?: string;
  description: string;
  owner: string | null;
  dueDate: string | null;
  priority: ActionPriority;
  status: ActionStatus;
  aiGenerated: boolean;
  overdue: boolean;
  createdAt: string;
  updatedAt: string;
}

export type NewActionPayload = Omit<
  ActionItem,
  | "id"
  | "meetingId"
  | "meetingTitle"
  | "aiGenerated"
  | "overdue"
  | "createdAt"
  | "updatedAt"
>;

