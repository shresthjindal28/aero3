"use client";

import { useQuery } from "@tanstack/react-query";

import { getSession } from "@/features/sessions/api/sessions.api";
import { sessionQueries } from "@/features/sessions/api/session-queries";

export function useSession(sessionId: string, enabled = true) {
  return useQuery({
    ...sessionQueries.detail(sessionId),
    queryFn: () => getSession(sessionId),
    enabled: enabled && Boolean(sessionId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "active" || status === "paused" ? 30_000 : false;
    },
  });
}
