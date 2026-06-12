"use client";

import { useQuery } from "@tanstack/react-query";

import { getPrescriptionByConsultation } from "@/features/prescription/api/prescription.api";
import { prescriptionQueryKeys } from "@/features/prescription/queries/prescription-queries";
import type { ApiError } from "@/lib/api/types/api-error.types";

export function usePrescriptionNote(consultationId: string) {
  return useQuery({
    queryKey: prescriptionQueryKeys.byConsultation(consultationId),
    queryFn: () => getPrescriptionByConsultation(consultationId),
    enabled: Boolean(consultationId),
    retry: (failureCount, error) => {
      const status = (error as unknown as ApiError)?.status;
      if (status === 404) return false;
      return failureCount < 2;
    },
  });
}
