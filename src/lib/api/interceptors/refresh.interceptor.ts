import type { AxiosError, AxiosInstance } from "axios";

import { refreshAccessToken } from "@/features/auth/api/refresh.api";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useTokenStore } from "@/features/auth/store/token.store";
import { clearSession } from "@/features/auth/utils/token-storage";
import { enqueueTokenRefresh } from "@/lib/api/refresh-token-queue";
import type { ApiErrorBody } from "@/lib/api/types/api-error.types";

export function createRefreshInterceptor(client: AxiosInstance) {
  return async (error: AxiosError<ApiErrorBody>) => {
    const originalRequest = error.config;

    if (
      !originalRequest ||
      error.response?.status !== 401 ||
      originalRequest.metadata?._retry
    ) {
      return Promise.reject(error);
    }

    const { refreshToken, actorType } = useTokenStore.getState();

    if (!refreshToken || !actorType) {
      clearSession();
      useAuthStore.getState().reset();
      return Promise.reject(error);
    }

    try {
      const tokens = await enqueueTokenRefresh(actorType, refreshToken, (token) =>
        refreshAccessToken(token),
      );

      useTokenStore.getState().setTokens({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
      });

      originalRequest.metadata = {
        ...originalRequest.metadata,
        _retry: true,
      };
      originalRequest.headers.Authorization = `Bearer ${tokens.access_token}`;

      return client(originalRequest);
    } catch (refreshError) {
      clearSession();
      useAuthStore.getState().reset();
      return Promise.reject(refreshError);
    }
  };
}
