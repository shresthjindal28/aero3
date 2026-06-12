"use client";

import { useQuery } from "@tanstack/react-query";

import { listPrescriptionVersions } from "@/features/prescription/api/prescription.api";
import { prescriptionQueryKeys } from "@/features/prescription/queries/prescription-queries";

export function usePrescriptionVersions(prescriptionId: string) {
  return useQuery({
    queryKey: prescriptionQueryKeys.versions(prescriptionId),
    queryFn: () => listPrescriptionVersions(prescriptionId),
    enabled: Boolean(prescriptionId),
  });
}
