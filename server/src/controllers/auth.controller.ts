import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";
import { signToken } from "../utils/token";
import { loginSchema, registerSchema } from "../validators/auth.validators";

const SALT_ROUNDS = 12;
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password-1", SALT_ROUNDS);

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = registerSchema.parse(req.body);

  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) throw new AppError(409, "An account with this email already exists.");

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { name, email, passwordHash },
    select: { id: true, name: true, email: true },
  });

  res.status(201).json({ user, token: signToken(user.id) });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { email } });
  const valid = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !valid) throw new AppError(401, "Invalid email or password.");

  res.json({
    user: { id: user.id, name: user.name, email: user.email },
    token: signToken(user.id),
  });
});