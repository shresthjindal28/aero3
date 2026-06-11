"use client";

import { useQuery } from "@tanstack/react-query";

import { getConsultation } from "@/features/consultations/api/consultations.api";
import { consultationQueries } from "@/features/consultations/queries/consultation-queries";

export function useConsultation(consultationId: string, enabled = true) {
  return useQuery({
    ...consultationQueries.detail(consultationId),
    queryFn: () => getConsultation(consultationId),
    enabled: enabled && Boolean(consultationId),
  });
}
