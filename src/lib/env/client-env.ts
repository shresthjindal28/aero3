import { z } from "zod";

const clientEnvSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z
    .string()
    .url()
    .default("http://localhost:8000/api/v1"),
  NEXT_PUBLIC_WS_BASE_URL: z
    .string()
    .default("ws://localhost:8000/api/v1/ws"),
  NEXT_PUBLIC_APP_NAME: z.string().default("AIRO"),
});

const parsed = clientEnvSchema.safeParse({
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_WS_BASE_URL: process.env.NEXT_PUBLIC_WS_BASE_URL,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
});

if (!parsed.success) {
  console.error("Invalid client environment variables", parsed.error.flatten());
  throw new Error("Invalid client environment variables");
}

export const clientEnv = parsed.data;
