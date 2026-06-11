"use client";

import { useEffect, useState } from "react";

import { websocketManager } from "@/shared/realtime/websocket-manager";
import type { WebSocketStatus } from "@/shared/realtime/types/websocket.types";

export function useWebSocketStatus(): WebSocketStatus {
  const [status, setStatus] = useState<WebSocketStatus>(
    websocketManager.getStatus(),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(websocketManager.getStatus());
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return status;
}
