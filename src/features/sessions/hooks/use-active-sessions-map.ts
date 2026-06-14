"use client";

import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";

import { listSessionsByConsultation } from "@/features/sessions/api/sessions.api";
import { resolveActiveSession } from "@/features/sessions/utils/resolve-active-session";
import type { Session } from "@/features/sessions/types/session.types";
import { queryKeys } from "@/shared/constants/query-keys";

const SESSION_STALE_MS = 60_000;

export function useActiveSessionsMap(consultationIds: string[]) {
  const uniqueIds = useMemo(
    () => [...new Set(consultationIds.filter(Boolean))],
    [consultationIds],
  );

  const queries = useQueries({
    queries: uniqueIds.map((consultationId) => ({
      queryKey: queryKeys.sessions.byConsultation(consultationId),
      queryFn: () => listSessionsByConsultation(consultationId),
      staleTime: SESSION_STALE_MS,
      enabled: Boolean(consultationId),
    })),
  });

  const sessionByConsultationId = useMemo(() => {
    const map = new Map<string, Session>();
    uniqueIds.forEach((consultationId, index) => {
      const sessions = queries[index]?.data;
      if (!sessions) return;
      const active = resolveActiveSession(sessions);
      if (active) {
        map.set(consultationId, active);
      }
    });
    return map;
  }, [queries, uniqueIds]);

  return {
    sessionByConsultationId,
    isLoading: queries.some((query) => query.isLoading && !query.data),
  };
}
