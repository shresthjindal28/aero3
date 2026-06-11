import type { InternalAxiosRequestConfig } from "axios";

import { createRequestId } from "@/lib/utils/id";

export function attachTracingInterceptor(
  config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig {
  const requestId = createRequestId();
  config.headers["X-Request-ID"] = requestId;
  config.metadata = {
    ...(config.metadata ?? {}),
    requestId,
  };
  return config;
}
