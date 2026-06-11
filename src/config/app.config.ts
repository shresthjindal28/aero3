import { clientEnv } from "@/lib/env/client-env";

export const appConfig = {
  name: clientEnv.NEXT_PUBLIC_APP_NAME,
  version: "0.1.0",
} as const;
