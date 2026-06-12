"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  approvePrescription,
  exportPrescription,
  updatePrescription,
} from "@/features/prescription/api/prescription.api";
import { prescriptionQueryKeys } from "@/features/prescription/queries/prescription-queries";
import type { PrescriptionUpdateInput } from "@/features/prescription/types/prescription.types";
import type { ApiError } from "@/lib/api/types/api-error.types";

export function useUpdatePrescription(consultationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      prescriptionId,
      input,
    }: {
      prescriptionId: string;
      input: PrescriptionUpdateInput;
    }) => updatePrescription(prescriptionId, input),
    onSuccess: (prescription) => {
      queryClient.setQueryData(
        prescriptionQueryKeys.byConsultation(consultationId),
        prescription,
      );
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Failed to save prescription");
    },
  });
}

export function useApprovePrescription(consultationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (prescriptionId: string) => approvePrescription(prescriptionId),
    onSuccess: (prescription) => {
      queryClient.setQueryData(
        prescriptionQueryKeys.byConsultation(consultationId),
        prescription,
      );
      toast.success("Prescription approved");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Failed to approve prescription");
    },
  });
}

export function useExportPrescriptionAudit(consultationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (prescriptionId: string) => exportPrescription(prescriptionId),
    onSuccess: (prescription) => {
      queryClient.setQueryData(
        prescriptionQueryKeys.byConsultation(consultationId),
        prescription,
      );
    },
  });
}
