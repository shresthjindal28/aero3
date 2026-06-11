import axios from "axios";

import { apiConfig } from "@/config/api.config";
import {
  attachErrorRejectInterceptor,
  attachErrorResponseInterceptor,
} from "@/lib/api/interceptors/error.interceptor";
import { attachTracingInterceptor } from "@/lib/api/interceptors/tracing.interceptor";

export const authClient = axios.create({
  baseURL: apiConfig.baseUrl,
  timeout: apiConfig.timeoutMs,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

authClient.interceptors.request.use((config) => attachTracingInterceptor(config));

authClient.interceptors.response.use(
  attachErrorResponseInterceptor,
  attachErrorRejectInterceptor,
);
