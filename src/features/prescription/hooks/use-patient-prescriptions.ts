"use client";

import { useQuery } from "@tanstack/react-query";

import { listPrescriptionsByPatient } from "@/features/prescription/api/prescription.api";
import { prescriptionQueryKeys } from "@/features/prescription/queries/prescription-queries";

export function usePatientPrescriptions(patientId: string, search?: string) {
  return useQuery({
    queryKey: prescriptionQueryKeys.byPatient(patientId, search),
    queryFn: () => listPrescriptionsByPatient(patientId, search),
    enabled: Boolean(patientId),
  });
}
