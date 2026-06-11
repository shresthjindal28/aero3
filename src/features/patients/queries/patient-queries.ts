import { getPatient, listPatients } from "@/features/patients/api/patients.api";
import { queryKeys } from "@/shared/constants/query-keys";

export const patientQueries = {
  all: () => ({
    queryKey: queryKeys.patients.all,
  }),
  list: () => ({
    queryKey: queryKeys.patients.list(),
    queryFn: listPatients,
  }),
  detail: (id: string) => ({
    queryKey: queryKeys.patients.detail(id),
    queryFn: () => getPatient(id),
    enabled: Boolean(id),
  }),
};
