import { z } from "zod";

const BUILD_FALLBACKS = {
  NEXT_PUBLIC_API_BASE_URL: "http://localhost:8000/api/v1",
  NEXT_PUBLIC_WS_BASE_URL: "ws://localhost:8000/api/v1/ws",
  NEXT_PUBLIC_APP_NAME: "AIRO",
} as const;

const clientEnvSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().url(),
  NEXT_PUBLIC_WS_BASE_URL: z.string().min(1),
  NEXT_PUBLIC_APP_NAME: z.string().default("AIRO"),
});

function resolveClientEnv() {
  const raw = {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_WS_BASE_URL: process.env.NEXT_PUBLIC_WS_BASE_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  };

  const parsed = clientEnvSchema.safeParse(raw);
  if (parsed.success) {
    return parsed.data;
  }

  const isBuildPhase =
    process.env.NEXT_PHASE === "phase-production-build" ||
    process.env.NEXT_PHASE === "phase-export";

  if (isBuildPhase) {
    console.warn(
      "Missing client environment variables during build; using fallbacks. Configure NEXT_PUBLIC_* in Vercel project settings.",
      parsed.error.flatten().fieldErrors,
    );
    return clientEnvSchema.parse(BUILD_FALLBACKS);
  }

  console.error("Invalid client environment variables", parsed.error.flatten());
  throw new Error("Invalid client environment variables");
}

export const clientEnv = resolveClientEnv();
