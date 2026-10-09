import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";
import { verifyToken } from "../utils/token";

export const requireAuth = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new AppError(401, "Authentication required.");
  }

  let userId: string;
  try {
    userId = verifyToken(header.slice(7));
  } catch {
    throw new AppError(401, "Your session has expired. Please sign in again.");
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!user) throw new AppError(401, "Your session has expired. Please sign in again.");

  req.userId = user.id;
  next();
});