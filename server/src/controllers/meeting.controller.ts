import type { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { parseDateOnly } from "../utils/dates";
import { TYPE_BY_LABEL } from "../utils/labels";
import { findOwnedMeeting, getUserId, paramId } from "../utils/ownership";
import {
  meetingBodySchema,
  meetingListQuerySchema,
  notesBodySchema,
   summaryBodySchema,
} from "../validators/meeting.validators";
import { extractMeetingText } from "../utils/extractMeetingText";
import { runMeetingAnalysis } from "../services/analysis.service";
import { toActionDto, toMeetingDto } from "../utils/serializers"; 
import { AppError } from "../utils/AppError";
import { hasVisibleText, sanitizeRichText } from "../utils/sanitizeRichText";
const dedupe = (names: string[]) =>
  names.filter((n, i) => names.findIndex((x) => x.toLowerCase() === n.toLowerCase()) === i);

export const listMeetings = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const { search } = meetingListQuerySchema.parse(req.query);

  const where: Prisma.MeetingWhereInput = { userId };
  if (search) where.title = { contains: search, mode: "insensitive" };

  const meetings = await prisma.meeting.findMany({ where, orderBy: { createdAt: "desc" } });
  res.json(meetings.map(toMeetingDto));
});

export const getMeeting = asyncHandler(async (req, res) => {
  const meeting = await findOwnedMeeting(paramId(req), getUserId(req));
  res.json(toMeetingDto(meeting));
});

export const createMeeting = asyncHandler(async (req, res) => {
  const userId = getUserId(req);

  if (typeof req.body.participants === "string") {
    try {
      req.body.participants = JSON.parse(req.body.participants);
    } catch {
      return res.status(400).json({
        message: "participants must be a valid JSON array.",
      });
    }
  }

  const body = meetingBodySchema.parse(req.body);

  const file = req.file;

  let transcript = body.transcript?.trim() ?? "";

  if (file) {
    transcript = await extractMeetingText(file);
  }

  if (!transcript) {
    return res.status(400).json({
      message: "Please provide a transcript or upload a meeting file.",
    });
  }

  const meeting = await prisma.meeting.create({
    data: {
      title: body.title,
      meetingDate: parseDateOnly(body.meetingDate),
      type: TYPE_BY_LABEL[body.type],
      participants: dedupe(body.participants),
      transcript,
      userId,
    },
  });

  res.status(201).json(toMeetingDto(meeting));
});

export const updateMeeting = asyncHandler(async (req, res) => {
  const userId = getUserId(req);

  const existing = await findOwnedMeeting(paramId(req), userId);

  if (typeof req.body.participants === "string") {
    try {
      req.body.participants = JSON.parse(req.body.participants);
    } catch {
      return res.status(400).json({
        message: "participants must be a valid JSON array.",
      });
    }
  }

  const body = meetingBodySchema.parse(req.body);

  const file = req.file;

  let transcript = body.transcript?.trim() ?? "";

  if (file) {
    transcript = await extractMeetingText(file);
  }

  if (!transcript) {
    transcript = existing.transcript;
  }

  const meeting = await prisma.meeting.update({
    where: { id: existing.id },
    data: {
      title: body.title,
      meetingDate: parseDateOnly(body.meetingDate),
      type: TYPE_BY_LABEL[body.type],
      participants: dedupe(body.participants),
      transcript,
    },
  });

  res.json(toMeetingDto(meeting));
});
export const deleteMeeting = asyncHandler(async (req, res) => {
  const existing = await findOwnedMeeting(paramId(req), getUserId(req));
  await prisma.meeting.delete({ where: { id: existing.id } }); 
    res.status(204).send();
});

export const updateMeetingNotes = asyncHandler(async (req, res) => {
  const existing = await findOwnedMeeting(paramId(req), getUserId(req));
  const { notes } = notesBodySchema.parse(req.body);

  const clean = notes ? sanitizeRichText(notes) : "";

  const meeting = await prisma.meeting.update({
    where: { id: existing.id },
    data: { notes: hasVisibleText(clean) ? clean : null },
  });
  res.json(toMeetingDto(meeting));
});

export const updateMeetingSummary = asyncHandler(async (req, res) => {
  const existing = await findOwnedMeeting(paramId(req), getUserId(req));

  if (existing.aiStatus === "PROCESSING") {
    throw new AppError(409, "Analysis is running. Please try again when it finishes.");
  }

  const { summary } = summaryBodySchema.parse(req.body);
  const clean = sanitizeRichText(summary);
  if (!hasVisibleText(clean)) throw new AppError(400, "Summary cannot be empty.");

  const meeting = await prisma.meeting.update({
    where: { id: existing.id },
    data: { summary: clean },
  });
  res.json(toMeetingDto(meeting));
});
export const analyzeMeeting = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const meeting = await findOwnedMeeting(paramId(req), userId);

  const result = await runMeetingAnalysis(meeting, userId);
  res.json({
    meeting: toMeetingDto(result.meeting),
    actionItems: result.actionItems.map(toActionDto),
  });
});