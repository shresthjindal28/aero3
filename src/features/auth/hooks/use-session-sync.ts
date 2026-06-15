"use client";

import { useEffect } from "react";

import { authConfig } from "@/config/auth.config";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useTokenStore } from "@/features/auth/store/token.store";

const sessionStorageKeys = new Set<string>(Object.values(authConfig.storageKeys));

export function useSessionSync() {
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.storageArea !== localStorage || !event.key) return;
      if (!sessionStorageKeys.has(event.key)) return;

      useTokenStore.getState().hydrate();
      const { accessToken, actorType } = useTokenStore.getState();

      if (accessToken && actorType) {
        useAuthStore.getState().setSession(actorType);
        return;
      }

      useAuthStore.getState().reset();
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
}
