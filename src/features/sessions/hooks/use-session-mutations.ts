"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  endSession,
  listSessionsByConsultation,
  pauseSession,
  resumeSession,
  startSession,
} from "@/features/sessions/api/sessions.api";
import type { ApiError } from "@/lib/api/types/api-error.types";
import { routes } from "@/shared/constants/routes";
import { queryKeys } from "@/shared/constants/query-keys";

export function useStartSession(consultationId: string) {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => startSession({ consultation_id: consultationId }),
    onSuccess: async (session) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.sessions.byConsultation(consultationId),
      });
      toast.success("Visit recording started");
      router.push(routes.app.sessionDetail(session.id));
    },
    onError: async (error: ApiError) => {
      if (error.status === 409) {
        try {
          const sessions = await listSessionsByConsultation(consultationId);
          const active = sessions.find(
            (session) => session.status === "active" || session.status === "paused",
          );
          if (active) {
            toast.info("Continuing your visit");
            router.push(routes.app.sessionDetail(active.id));
            return;
          }
        } catch {
          // Fall through to default error toast.
        }
      }
      toast.error(error.message ?? "Unable to begin visit");
    },
  });
}

export function usePauseSession(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => pauseSession(sessionId),
    onSuccess: (session) => {
      queryClient.setQueryData(queryKeys.sessions.detail(sessionId), session);
    },
  });
}

export function useResumeSession(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => resumeSession(sessionId),
    onSuccess: (session) => {
      queryClient.setQueryData(queryKeys.sessions.detail(sessionId), session);
    },
  });
}

export function useEndSession(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => endSession(sessionId),
    onSuccess: (session) => {
      queryClient.setQueryData(queryKeys.sessions.detail(sessionId), session);
      toast.success("Session ended");
    },
  });
}
