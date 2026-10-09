import type { Request } from "express";
import { prisma } from "../config/prisma";
import { AppError } from "./AppError";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isUuid = (v: string) => UUID_REGEX.test(v);

export const paramId = (req: Request): string => String(req.params.id);

export function getUserId(req: Request): string {
  if (!req.userId) throw new AppError(401, "Authentication required.");
  return req.userId;
}

/** Returns the meeting only if it belongs to this user; otherwise 404 (never reveals other users' data). */
export async function findOwnedMeeting(id: string, userId: string) {
  const meeting = isUuid(id) ? await prisma.meeting.findFirst({ where: { id, userId } }) : null;
  if (!meeting) throw new AppError(404, "Meeting not found.");
  return meeting;
}

export async function findOwnedAction(id: string, userId: string) {
  const action = isUuid(id)
    ? await prisma.actionItem.findFirst({ where: { id, userId }, include: { meeting: { select: { title: true } } } })
    : null;
  if (!action) throw new AppError(404, "Action item not found.");
  return action;
}