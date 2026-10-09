import type {
  ActionItem,
  Meeting,
} from "@prisma/client";

import {
  todayUtc,
  toDateOnly,
} from "./dates";

import {
  LABEL_BY_PRIORITY,
  LABEL_BY_STATUS,
  LABEL_BY_TYPE,
} from "./labels";

export function toMeetingDto(m: Meeting) {
  return {
    id: m.id,
    title: m.title,
    meetingDate: toDateOnly(m.meetingDate),
    type: LABEL_BY_TYPE[m.type],
    participants: m.participants,
    transcript: m.transcript,

    notes: m.notes,

    aiStatus: m.aiStatus,
    aiError: m.aiError,
    aiProcessedAt: m.aiProcessedAt,

    summary: m.summary,
    purpose: m.purpose,
    keyPoints: m.keyPoints,
    outcomes: m.outcomes,
    decisions: m.decisions,
    risks: m.risks,
    nextSteps: m.nextSteps,
    openQuestions: m.openQuestions,

    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
  };
}

type ActionWithMeeting = ActionItem & {
  meeting?: {
    title: string;
  } | null;
};

export function toActionDto(a: ActionWithMeeting) {
  const overdue =
    !!a.dueDate &&
    a.dueDate < todayUtc() &&
    a.status !== "COMPLETED";

  return {
    id: a.id,
    meetingId: a.meetingId,
    meetingTitle: a.meeting?.title ?? undefined,

    description: a.description,
    owner: a.owner,

    dueDate: a.dueDate
      ? toDateOnly(a.dueDate)
      : null,

    priority: LABEL_BY_PRIORITY[a.priority],
    status: LABEL_BY_STATUS[a.status],

    aiGenerated: a.aiGenerated,
    overdue,

    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
  };
}