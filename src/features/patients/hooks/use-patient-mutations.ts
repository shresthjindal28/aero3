"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  createPatient,
  deletePatient,
  updatePatient,
} from "@/features/patients/api/patients.api";
import type { PatientCreateInput, PatientUpdateInput } from "@/features/patients/types/patient.types";
import type { ApiError } from "@/lib/api/types/api-error.types";
import { invalidationHelpers } from "@/lib/query/invalidation-helpers";
import { routes } from "@/shared/constants/routes";
import { queryKeys } from "@/shared/constants/query-keys";
import type { Patient } from "@/features/patients/types/patient.types";

export function useCreatePatient() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: PatientCreateInput) => createPatient(payload),
    onSuccess: async (patient) => {
      await invalidationHelpers.invalidatePatients(queryClient);
      toast.success("Patient created");
      router.push(routes.app.patientDetail(patient.id));
    },
  });
}

export function useUpdatePatient(patientId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: PatientUpdateInput) => updatePatient(patientId, payload),
    onSuccess: async (patient) => {
      queryClient.setQueryData(queryKeys.patients.detail(patientId), patient);
      await invalidationHelpers.invalidatePatients(queryClient);
      toast.success("Patient updated");
      router.push(routes.app.patientDetail(patientId));
    },
  });
}

export function useDeletePatient() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (patientId: string) => deletePatient(patientId),
    onMutate: async (patientId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.patients.all });

      const previousList = queryClient.getQueryData<Patient[]>(
        queryKeys.patients.list(),
      );

      if (previousList) {
        queryClient.setQueryData<Patient[]>(
          queryKeys.patients.list(),
          previousList.filter((patient) => patient.id !== patientId),
        );
      }

      return { previousList };
    },
    onSuccess: async () => {
      await invalidationHelpers.invalidatePatients(queryClient);
      toast.success("Patient removed");
      router.push(routes.app.patients);
    },
    onError: (error: ApiError, _patientId, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(queryKeys.patients.list(), context.previousList);
      }
      toast.error(error.message ?? "Unable to delete patient");
    },
    onSettled: async () => {
      await invalidationHelpers.invalidatePatients(queryClient);
    },
  });
}
