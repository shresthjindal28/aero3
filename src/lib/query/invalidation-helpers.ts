import type { QueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/shared/constants/query-keys";

export const invalidationHelpers = {
  invalidateAuth(queryClient: QueryClient) {
    return queryClient.invalidateQueries({ queryKey: queryKeys.doctor.me });
  },

  invalidatePatients(queryClient: QueryClient) {
    return queryClient.invalidateQueries({ queryKey: queryKeys.patients.all });
  },

  invalidateConsultations(queryClient: QueryClient, patientId?: string) {
    if (patientId) {
      return queryClient.invalidateQueries({
        queryKey: queryKeys.consultations.byPatient(patientId),
      });
    }
    return queryClient.invalidateQueries({
      queryKey: queryKeys.consultations.all,
    });
  },
};
