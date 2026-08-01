import 'dotenv/config';
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum([
    "development",
    "production",
  ]).default("development"),

  PORT: z.coerce
    .number()
    .optional()
    .default(5001)
    .describe('The application port number'),

  PRIVATE_ACCESS_KEY: z.string()
    .describe('The private access key for JWT signing'),

  PUBLIC_ACCESS_KEY: z.string()
    .describe('The public access key for JWT signing'),

  DATABASE_URL: z.url().describe('Database connection URL'),

  DATABASE_USE_SSL: z.enum(["true", "false"]).default("false").transform((val) => val === "true").describe('Use SSL for database connection'),

  SALT_WORK_FACTOR: z.coerce
    .number()
    .optional()
    .default(10)
    .describe('The salt work factor for hashing passwords'),

  JWT_EXPIRES_IN: z.string()
    .default('1d')
    .transform((val) => val as import('jsonwebtoken').SignOptions['expiresIn'])
    .describe('The expiration time for JWT tokens'),
});

export type Env = z.infer<typeof envSchema>;

const result = envSchema.safeParse(process.env);

if (!result.success) {
  const formattedErrors = z.flattenError(result.error).fieldErrors;
  throw new Error(
    `Invalid environment variables:\n${JSON.stringify(
      formattedErrors,
      null,
      2,
    )}`,
  );
}

export const env: Env = result.data;