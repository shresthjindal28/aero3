import { clientEnv } from "@/lib/env/client-env";

export const websocketConfig = {
  baseUrl: clientEnv.NEXT_PUBLIC_WS_BASE_URL,
  heartbeatIntervalMs: 30_000,
  reconnect: {
    initialDelayMs: 1_000,
    maxDelayMs: 30_000,
    maxAttempts: 10,
    backoffMultiplier: 1.5,
  },
  closeCodes: {
    unauthorized: 4401,
    forbidden: 4403,
    notFound: 4404,
  },
} as const;
