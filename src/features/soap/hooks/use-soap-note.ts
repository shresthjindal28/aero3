"use client";

import { useQuery } from "@tanstack/react-query";

import { getSoapNoteByConsultation } from "@/features/soap/api/soap.api";
import { soapQueries } from "@/features/soap/queries/soap-queries";
import type { ApiError } from "@/lib/api/types/api-error.types";

export function useSoapNote(consultationId: string, enabled = true) {
  return useQuery({
    ...soapQueries.byConsultation(consultationId),
    queryFn: () => getSoapNoteByConsultation(consultationId),
    enabled: enabled && Boolean(consultationId),
    retry: (failureCount, error) => {
      const apiError = error as unknown as ApiError;
      if (apiError.status === 404) return false;
      return failureCount < 2;
    },
  });
}
