export const ACTION_STATUSES = [
  "Open",
  "In Progress",
  "Blocked",
  "Completed",
] as const;

export const ACTION_PRIORITIES = [
  "Low",
  "Medium",
  "High",
] as const;

export type ActionStatus = (typeof ACTION_STATUSES)[number];
export type ActionPriority = (typeof ACTION_PRIORITIES)[number];

export interface ActionItem {
  id: string;
  meetingId: string;
  meetingTitle?: string;

  description: string;
  owner: string;

  dueDate: string | null;

  priority: ActionPriority;
  status: ActionStatus;

  aiGenerated: boolean;
  overdue: boolean;

  createdAt: string;
  updatedAt: string;
}

export type NewActionPayload = {
  description: string;
  owner: string;
  dueDate: string | null;
  priority: ActionPriority;
  status: ActionStatus;
};