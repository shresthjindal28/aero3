import { queryKeys } from "@/shared/constants/query-keys";

export const adminQueries = {
  doctors: () => ({
    queryKey: queryKeys.admin.doctors,
  }),
  doctorsPending: () => ({
    queryKey: queryKeys.admin.doctorsPending,
  }),
};
