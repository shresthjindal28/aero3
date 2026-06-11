import axios, { type AxiosInstance } from "axios";

import { apiConfig } from "@/config/api.config";
import { attachAuthInterceptor } from "@/lib/api/interceptors/auth.interceptor";
import {
  attachErrorRejectInterceptor,
  attachErrorResponseInterceptor,
} from "@/lib/api/interceptors/error.interceptor";
import { createRefreshInterceptor } from "@/lib/api/interceptors/refresh.interceptor";
import { attachTracingInterceptor } from "@/lib/api/interceptors/tracing.interceptor";

function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: apiConfig.baseUrl,
    timeout: apiConfig.timeoutMs,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  client.interceptors.request.use((config) => {
    const traced = attachTracingInterceptor(config);
    return attachAuthInterceptor(traced);
  });

  client.interceptors.response.use(
    attachErrorResponseInterceptor,
    createRefreshInterceptor(client),
  );

  client.interceptors.response.use(
    (response) => response,
    attachErrorRejectInterceptor,
  );

  return client;
}

export const apiClient = createApiClient();
