"use client";

import { useQuery } from "@tanstack/react-query";

import { getPatient } from "@/features/patients/api/patients.api";
import { patientQueries } from "@/features/patients/queries/patient-queries";

export function usePatient(patientId: string, enabled = true) {
  return useQuery({
    ...patientQueries.detail(patientId),
    queryFn: () => getPatient(patientId),
    enabled: enabled && Boolean(patientId),
  });
}
