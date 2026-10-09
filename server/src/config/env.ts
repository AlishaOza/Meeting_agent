import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  CLIENT_URL: z.string().default("http://localhost:5173"),

  AI_PROVIDER: z.enum(["gemini", "mock"]).default("mock"),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default("gemini-2.5-flash"),
  AI_TIMEOUT_MS: z.coerce.number().default(60000),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
  console.error(`Invalid environment variables -> ${details}`);
  process.exit(1);
}

if (parsed.data.AI_PROVIDER === "gemini" && !parsed.data.GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is required when AI_PROVIDER=gemini");
  process.exit(1);
}

export const env = parsed.data;