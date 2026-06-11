import type { InternalAxiosRequestConfig } from "axios";

import { useTokenStore } from "@/features/auth/store/token.store";

export function attachAuthInterceptor(
  config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig {
  const { accessToken } = useTokenStore.getState();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
}
