"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  approvePrescription,
  exportPrescription,
  printPrescription,
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
      queryClient.setQueryData(
        prescriptionQueryKeys.byId(prescription.id),
        prescription,
      );
      void queryClient.invalidateQueries({
        queryKey: prescriptionQueryKeys.versions(prescription.id),
      });
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
      queryClient.setQueryData(
        prescriptionQueryKeys.byId(prescription.id),
        prescription,
      );
      void queryClient.invalidateQueries({
        queryKey: prescriptionQueryKeys.byPatient(prescription.patient_id),
      });
      toast.success("Prescription approved and added to patient memory");
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

export function usePrintPrescriptionAudit(_consultationId: string) {
  return useMutation({
    mutationFn: (prescriptionId: string) => printPrescription(prescriptionId),
  });
}
