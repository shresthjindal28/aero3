"use client";

import { useEffect, type ReactNode } from "react";

import { websocketManager } from "@/shared/realtime/websocket-manager";

type RealtimeProviderProps = {
  children: ReactNode;
};

export function RealtimeProvider({ children }: RealtimeProviderProps) {
  useEffect(() => {
    return () => {
      websocketManager.shutdown();
    };
  }, []);

  return <>{children}</>;
}
