"use client";

import { useEffect, useRef } from "react";

import { authConfig } from "@/config/auth.config";
import { refreshStoredSession } from "@/features/auth/utils/refresh-session";
import { getAccessTokenExpiryMs } from "@/features/auth/utils/jwt";
import { readStoredSession } from "@/features/auth/utils/token-storage";
import { useTokenStore } from "@/features/auth/store/token.store";

function shouldRefreshAccessToken(accessToken: string): boolean {
  const expiresAtMs = getAccessTokenExpiryMs(accessToken);
  if (!expiresAtMs) return false;
  return Date.now() >= expiresAtMs - authConfig.refreshBufferMs;
}

export function useSessionRefresh() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshingRef = useRef(false);

  useEffect(() => {
    const clearScheduledRefresh = () => {
      if (!timerRef.current) return;
      clearTimeout(timerRef.current);
      timerRef.current = null;
    };

    const runRefresh = async () => {
      if (refreshingRef.current) return;
      refreshingRef.current = true;

      try {
        await refreshStoredSession();
      } finally {
        refreshingRef.current = false;
        scheduleRefresh();
      }
    };

    const scheduleRefresh = () => {
      clearScheduledRefresh();

      const session = readStoredSession();
      const accessToken =
        session.accessToken ?? useTokenStore.getState().accessToken;
      const refreshToken =
        session.refreshToken ?? useTokenStore.getState().refreshToken;
      const actorType = session.actorType ?? useTokenStore.getState().actorType;

      if (!accessToken || !refreshToken || !actorType) return;

      if (shouldRefreshAccessToken(accessToken)) {
        void runRefresh();
        return;
      }

      const expiresAtMs = getAccessTokenExpiryMs(accessToken);
      if (!expiresAtMs) return;

      const delayMs = Math.max(
        expiresAtMs - authConfig.refreshBufferMs - Date.now(),
        0,
      );

      timerRef.current = setTimeout(() => {
        void runRefresh();
      }, delayMs);
    };

    const onResume = () => {
      useTokenStore.getState().hydrate();
      scheduleRefresh();
    };

    scheduleRefresh();
    document.addEventListener("visibilitychange", onResume);
    window.addEventListener("focus", onResume);

    return () => {
      clearScheduledRefresh();
      document.removeEventListener("visibilitychange", onResume);
      window.removeEventListener("focus", onResume);
    };
  }, []);
}
