import {
  createConsultation,
  deleteConsultation,
  getConsultation,
  listConsultations,
  updateConsultation,
} from "@/features/consultations/api/consultations.api";
import { queryKeys } from "@/shared/constants/query-keys";

export const consultationQueries = {
  all: () => ({
    queryKey: queryKeys.consultations.all,
  }),
  list: (patientId?: string) => ({
    queryKey: patientId
      ? queryKeys.consultations.byPatient(patientId)
      : queryKeys.consultations.all,
    queryFn: () => listConsultations(patientId),
  }),
  detail: (id: string) => ({
    queryKey: queryKeys.consultations.detail(id),
    queryFn: () => getConsultation(id),
    enabled: Boolean(id),
  }),
};

export const consultationMutations = {
  create: createConsultation,
  update: updateConsultation,
  delete: deleteConsultation,
};
