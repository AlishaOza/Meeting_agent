import { Prisma } from "@prisma/client";
import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError";
import { logger } from "../utils/logger";

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({ message: "Route not found." });
};

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof ZodError) {
    const errors: Record<string, string> = {};
    for (const issue of err.issues) {
      const field = issue.path.join(".") || "body";
      if (!errors[field]) {
        errors[field] = issue.code === "invalid_type" ? `${field} is missing or invalid.` : issue.message;
      }
    }
    res.status(400).json({ message: Object.values(errors)[0], errors });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.status).json({ message: err.message, ...(err.errors ? { errors: err.errors } : {}) });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      res.status(409).json({ message: "A record with these details already exists." });
      return;
    }
    if (err.code === "P2025") {
      res.status(404).json({ message: "Record not found." });
      return;
    }
  }

  if (err?.type === "entity.parse.failed") {
    res.status(400).json({ message: "Invalid JSON in request body." });
    return;
  }
  if (err?.type === "entity.too.large") {
    res.status(413).json({ message: "Request is too large." });
    return;
  }

  logger.error(`${req.method} ${req.originalUrl} failed`, err);
  res.status(500).json({ message: "Something went wrong. Please try again." });
};