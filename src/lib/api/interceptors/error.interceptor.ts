import type { AxiosError, AxiosResponse } from "axios";

import { normalizeApiError } from "@/lib/api/error-normalizer";
import type { ApiErrorBody } from "@/lib/api/types/api-error.types";

declare module "axios" {
  export interface AxiosRequestConfig {
    metadata?: {
      requestId?: string;
      _retry?: boolean;
    };
  }
}

export function attachErrorResponseInterceptor(
  response: AxiosResponse,
): AxiosResponse {
  return response;
}

export function attachErrorRejectInterceptor(
  error: AxiosError<ApiErrorBody>,
): Promise<never> {
  const requestId = error.config?.metadata?.requestId;
  return Promise.reject(normalizeApiError(error, requestId));
}
