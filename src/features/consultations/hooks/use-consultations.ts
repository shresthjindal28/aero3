"use client";

import { useQuery } from "@tanstack/react-query";

import { listConsultations } from "@/features/consultations/api/consultations.api";
import { consultationQueries } from "@/features/consultations/queries/consultation-queries";

export function useConsultations(patientId?: string, enabled = true) {
  return useQuery({
    ...consultationQueries.list(patientId),
    queryFn: () => listConsultations(patientId),
    enabled,
  });
}
