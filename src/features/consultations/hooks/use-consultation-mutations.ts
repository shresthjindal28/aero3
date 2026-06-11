"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  createConsultation,
  deleteConsultation,
  updateConsultation,
} from "@/features/consultations/api/consultations.api";
import type {
  Consultation,
  ConsultationCreateInput,
  ConsultationUpdateInput,
} from "@/features/consultations/types/consultation.types";
import type { ApiError } from "@/lib/api/types/api-error.types";
import { invalidationHelpers } from "@/lib/query/invalidation-helpers";
import { routes } from "@/shared/constants/routes";
import { queryKeys } from "@/shared/constants/query-keys";

export function useCreateConsultation(patientId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: Omit<ConsultationCreateInput, "patient_id">) =>
      createConsultation({ ...payload, patient_id: patientId }),
    onSuccess: async (consultation) => {
      await invalidationHelpers.invalidateConsultations(queryClient, patientId);
      toast.success("Consultation created");
      router.push(routes.app.consultationDetail(consultation.id));
    },
  });
}

export function useUpdateConsultation(consultationId: string, patientId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ConsultationUpdateInput) =>
      updateConsultation(consultationId, payload),
    onSuccess: async (consultation) => {
      queryClient.setQueryData(
        queryKeys.consultations.detail(consultationId),
        consultation,
      );
      await invalidationHelpers.invalidateConsultations(
        queryClient,
        patientId ?? consultation.patient_id,
      );
      toast.success("Consultation updated");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Unable to update consultation");
    },
  });
}

export function useDeleteConsultation(patientId?: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (consultationId: string) => deleteConsultation(consultationId),
    onMutate: async (consultationId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.consultations.all });

      const listKey = patientId
        ? queryKeys.consultations.byPatient(patientId)
        : queryKeys.consultations.all;

      const previousList = queryClient.getQueryData<Consultation[]>(listKey);

      if (previousList) {
        queryClient.setQueryData<Consultation[]>(
          listKey,
          previousList.filter((item) => item.id !== consultationId),
        );
      }

      return { previousList, listKey };
    },
    onSuccess: async (_data, consultationId) => {
      await invalidationHelpers.invalidateConsultations(queryClient, patientId);
      queryClient.removeQueries({
        queryKey: queryKeys.consultations.detail(consultationId),
      });
      toast.success("Consultation deleted");
      if (patientId) {
        router.push(routes.app.patientDetail(patientId));
      } else {
        router.push(routes.app.consultations);
      }
    },
    onError: (error: ApiError, _id, context) => {
      if (context?.previousList && context.listKey) {
        queryClient.setQueryData(context.listKey, context.previousList);
      }
      toast.error(error.message ?? "Unable to delete consultation");
    },
    onSettled: async () => {
      await invalidationHelpers.invalidateConsultations(queryClient, patientId);
    },
  });
}
