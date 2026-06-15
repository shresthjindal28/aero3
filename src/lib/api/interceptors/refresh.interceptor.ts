import type { AxiosError, AxiosInstance } from "axios";

import { useAuthStore } from "@/features/auth/store/auth.store";
import { useTokenStore } from "@/features/auth/store/token.store";
import { refreshStoredSession } from "@/features/auth/utils/refresh-session";
import { clearSession, readStoredSession } from "@/features/auth/utils/token-storage";
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

    const storedSession = readStoredSession();
    const refreshToken =
      storedSession.refreshToken ?? useTokenStore.getState().refreshToken;
    const actorType = storedSession.actorType ?? useTokenStore.getState().actorType;

    if (!refreshToken || !actorType) {
      clearSession();
      useAuthStore.getState().reset();
      return Promise.reject(error);
    }

    try {
      const refreshed = await refreshStoredSession(actorType, refreshToken);
      if (!refreshed) {
        throw new Error("Unable to refresh session");
      }

      const accessToken = useTokenStore.getState().accessToken;
      if (!accessToken) {
        throw new Error("Missing refreshed access token");
      }

      originalRequest.metadata = {
        ...originalRequest.metadata,
        _retry: true,
      };
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;

      return client(originalRequest);
    } catch (refreshError) {
      clearSession();
      useAuthStore.getState().reset();
      return Promise.reject(refreshError);
    }
  };
}
