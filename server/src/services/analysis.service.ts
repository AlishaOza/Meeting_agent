import type { Meeting, Prisma } from "@prisma/client";
import { ZodError } from "zod";

import { getAiProvider } from "../ai";
import { AiServiceError } from "../ai/ai.types";
import {
  analysisSchema,
  type MeetingAnalysis,
} from "../ai/analysis.schema";

import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";
import { parseDateOnly, toDateOnly } from "../utils/dates";
import {
  LABEL_BY_TYPE,
  PRIORITY_BY_LABEL,
  STATUS_BY_LABEL,
} from "../utils/labels";
import { logger } from "../utils/logger";

const MAX_TRANSCRIPT_CHARS = 150_000;
const STALE_PROCESSING_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 2;

function parseModelJson(raw: string): unknown {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");

  return JSON.parse(cleaned);
}

async function generateAnalysis(
  meeting: Meeting
): Promise<MeetingAnalysis> {
  const provider = getAiProvider();

  const input = {
    title: meeting.title,
    meetingDate: toDateOnly(meeting.meetingDate),
    type: LABEL_BY_TYPE[meeting.type],
    participants: meeting.participants,
    transcript: meeting.transcript,
  };

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const raw = await provider.analyze(input);

    try {
      const parsed = parseModelJson(raw);

      return analysisSchema.parse(parsed);
    } catch (err) {
      if (
        !(err instanceof SyntaxError) &&
        !(err instanceof ZodError)
      ) {
        throw err;
      }

      logger.warn(
        `AI output invalid (attempt ${attempt}/${MAX_ATTEMPTS})`,
        {
          meetingId: meeting.id,
          provider: provider.name,
        }
      );
    }
  }

  throw new AiServiceError(
    "The AI returned an unexpected response format. Please try again."
  );
}

export async function runMeetingAnalysis(
  meeting: Meeting,
  userId: string
) {
  if (meeting.transcript.length > MAX_TRANSCRIPT_CHARS) {
    throw new AppError(
      413,
      "This transcript is too long for AI analysis (maximum 150,000 characters)."
    );
  }

  const claimed = await prisma.meeting.updateMany({
    where: {
      id: meeting.id,
      userId,
      OR: [
        {
          aiStatus: {
            not: "PROCESSING",
          },
        },
        {
          updatedAt: {
            lt: new Date(
              Date.now() - STALE_PROCESSING_MS
            ),
          },
        },
      ],
    },

    data: {
      aiStatus: "PROCESSING",
      aiError: null,
    },
  });

  if (claimed.count === 0) {
    throw new AppError(
      409,
      "Analysis is already in progress for this meeting."
    );
  }

  const startedAt = Date.now();

  try {
    const analysis = await generateAnalysis(meeting);

    const result = await prisma.$transaction(async (tx) => {
      /*
       * Delete only AI-generated action items.
       * Manually created action items remain untouched.
       */
      await tx.actionItem.deleteMany({
        where: {
          meetingId: meeting.id,
          userId,
          aiGenerated: true,
        },
      });

      /*
       * Create new AI-generated action items.
       */
      if (analysis.actionItems.length > 0) {
        const base = Date.now();

        const rows: Prisma.ActionItemCreateManyInput[] =
          analysis.actionItems.map((item, index) => ({
            description: item.description,
            owner: item.owner,
            dueDate: item.dueDate
              ? parseDateOnly(item.dueDate)
              : null,

            priority: PRIORITY_BY_LABEL[item.priority],
            status: STATUS_BY_LABEL[item.status],

            aiGenerated: true,

            meetingId: meeting.id,
            userId,

            createdAt: new Date(base + index),
          }));

        await tx.actionItem.createMany({
          data: rows,
        });
      }

      /*
       * Save AI analysis into the meeting.
       */
      const updated = await tx.meeting.update({
        where: {
          id: meeting.id,
        },

        data: {
          summary: analysis.summary,
          purpose: analysis.purpose,

          keyPoints: analysis.keyPoints,
          outcomes: analysis.outcomes,

          decisions: analysis.decisions,
          risks: analysis.risks,

          nextSteps: analysis.nextSteps,
          openQuestions: analysis.openQuestions,

          aiStatus: "COMPLETED",
          aiError: null,
          aiProcessedAt: new Date(),
        },
      });

      /*
       * Return all action items:
       * - AI generated
       * - manually created
       */
      const actionItems = await tx.actionItem.findMany({
        where: {
          meetingId: meeting.id,
          userId,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      return {
        meeting: updated,
        actionItems,
      };
    });

    logger.info(
      `AI analysis completed meeting=${meeting.id} ` +
        `items=${analysis.actionItems.length} ` +
        `ms=${Date.now() - startedAt}`
    );

    return result;
  } catch (err) {
    const isAiError = err instanceof AiServiceError;

    const message = isAiError
      ? err.message
      : "Analysis failed. Please try again.";

    if (!isAiError) {
      logger.error(
        `AI analysis failed meeting=${meeting.id}`,
        err
      );
    }

    await prisma.meeting
      .update({
        where: {
          id: meeting.id,
        },

        data: {
          aiStatus: "FAILED",
          aiError: message,
        },
      })
      .catch((error) => {
        logger.error(
          "Could not record AI failure",
          error
        );
      });

    throw new AppError(
      isAiError ? 502 : 500,
      message
    );
  }
}