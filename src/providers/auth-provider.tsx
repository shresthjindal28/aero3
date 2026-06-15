"use client";

import { useEffect, type ReactNode } from "react";

import { useSessionRefresh } from "@/features/auth/hooks/use-session-refresh";
import { useSessionSync } from "@/features/auth/hooks/use-session-sync";
import { useAuthStore } from "@/features/auth/store/auth.store";

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const hydrate = useAuthStore((state) => state.hydrate);

  useSessionRefresh();
  useSessionSync();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return <>{children}</>;
}
