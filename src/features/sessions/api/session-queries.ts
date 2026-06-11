import { queryKeys } from "@/shared/constants/query-keys";

export const sessionQueries = {
  byConsultation: (consultationId: string) => ({
    queryKey: queryKeys.sessions.byConsultation(consultationId),
  }),
  detail: (id: string) => ({
    queryKey: queryKeys.sessions.detail(id),
  }),
};
