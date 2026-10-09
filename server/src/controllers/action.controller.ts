import type { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { parseDateOnly, todayUtc } from "../utils/dates";
import { PRIORITY_BY_LABEL, STATUS_BY_LABEL } from "../utils/labels";
import { findOwnedAction, findOwnedMeeting, getUserId, paramId } from "../utils/ownership";
import { toActionDto } from "../utils/serializers";
import {
  actionQuerySchema,
  createActionSchema,
  updateActionSchema,
} from "../validators/action.validators";

function normalizeOwner(value: string | null): string | null {
  const trimmed = value?.trim();
  return !trimmed || trimmed.toLowerCase() === "unassigned" ? null : trimmed;
}

export const listMeetingActions = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const meeting = await findOwnedMeeting(paramId(req), userId);

  const actions = await prisma.actionItem.findMany({
    where: { meetingId: meeting.id, userId },
    orderBy: { createdAt: "asc" },
  });
  res.json(actions.map(toActionDto));
});

export const createAction = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const meeting = await findOwnedMeeting(paramId(req), userId);
  const body = createActionSchema.parse(req.body);

  const action = await prisma.actionItem.create({
    data: {
      description: body.description,
      owner: normalizeOwner(body.owner ?? null),
      dueDate: body.dueDate ? parseDateOnly(body.dueDate) : null,
      priority: PRIORITY_BY_LABEL[body.priority],
      status: STATUS_BY_LABEL[body.status],
      aiGenerated: false,
      meetingId: meeting.id,
      userId, 
    },
  });
  res.status(201).json(toActionDto(action));
});

export const listActions = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const q = actionQuerySchema.parse(req.query);

  const where: Prisma.ActionItemWhereInput = { userId };
  const and: Prisma.ActionItemWhereInput[] = [];

  if (q.status) where.status = STATUS_BY_LABEL[q.status];
  if (q.priority) where.priority = PRIORITY_BY_LABEL[q.priority];
  if (q.meetingId) where.meetingId = q.meetingId;
  if (q.search) where.description = { contains: q.search, mode: "insensitive" };

  if (q.owner) {
    where.owner =
      q.owner.toLowerCase() === "unassigned" ? null : { equals: q.owner, mode: "insensitive" };
  }

  if (q.dueFrom) and.push({ dueDate: { gte: parseDateOnly(q.dueFrom) } });
  if (q.dueTo) and.push({ dueDate: { lte: parseDateOnly(q.dueTo) } });
  if (q.overdue) and.push({ dueDate: { lt: todayUtc() } }, { status: { not: "COMPLETED" } });
  if (and.length > 0) where.AND = and;

  const actions = await prisma.actionItem.findMany({
    where,
    include: { meeting: { select: { title: true } } },
    orderBy: [{ dueDate: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }],
  });
  res.json(actions.map(toActionDto));
});

export const updateAction = asyncHandler(async (req, res) => {
  const existing = await findOwnedAction(paramId(req), getUserId(req));
  const body = updateActionSchema.parse(req.body);

  const data: Prisma.ActionItemUpdateInput = {};
  if (body.description !== undefined) data.description = body.description;
  if (body.owner !== undefined) data.owner = normalizeOwner(body.owner);
  if (body.dueDate !== undefined) data.dueDate = body.dueDate ? parseDateOnly(body.dueDate) : null;
  if (body.priority) data.priority = PRIORITY_BY_LABEL[body.priority];
  if (body.status) data.status = STATUS_BY_LABEL[body.status];

  const action = await prisma.actionItem.update({
    where: { id: existing.id },
    data,
    include: { meeting: { select: { title: true } } },
  });
  res.json(toActionDto(action));
});

export const deleteAction = asyncHandler(async (req, res) => {
  const existing = await findOwnedAction(paramId(req), getUserId(req));
  await prisma.actionItem.delete({ where: { id: existing.id } });
  res.status(204).send();
});