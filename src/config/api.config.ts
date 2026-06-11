import { clientEnv } from "@/lib/env/client-env";

export const apiConfig = {
  baseUrl: clientEnv.NEXT_PUBLIC_API_BASE_URL,
  timeoutMs: 30_000,
  apiVersion: "v1",
} as const;
