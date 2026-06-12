"use client";

import { useQuery } from "@tanstack/react-query";

import { getPrescription } from "@/features/prescription/api/prescription.api";
import { prescriptionQueryKeys } from "@/features/prescription/queries/prescription-queries";

export function usePrescription(prescriptionId: string, enabled = true) {
  return useQuery({
    queryKey: prescriptionQueryKeys.byId(prescriptionId),
    queryFn: () => getPrescription(prescriptionId),
    enabled: Boolean(prescriptionId) && enabled,
  });
}
