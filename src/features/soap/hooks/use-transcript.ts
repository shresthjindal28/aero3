"use client";

import { useQuery } from "@tanstack/react-query";

import { getTranscriptByConsultation } from "@/features/soap/api/transcript.api";
import { transcriptQueries } from "@/features/soap/queries/soap-queries";
import type { ApiError } from "@/lib/api/types/api-error.types";

export function useConsultationTranscript(
  consultationId: string,
  enabled = true,
) {
  return useQuery({
    ...transcriptQueries.byConsultation(consultationId),
    queryFn: () => getTranscriptByConsultation(consultationId),
    enabled: enabled && Boolean(consultationId),
    retry: (failureCount, error) => {
      const apiError = error as unknown as ApiError;
      if (apiError.status === 404) return false;
      return failureCount < 2;
    },
  });
}
