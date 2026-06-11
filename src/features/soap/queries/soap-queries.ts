import { queryKeys } from "@/shared/constants/query-keys";

export const soapQueries = {
  byConsultation: (consultationId: string) => ({
    queryKey: queryKeys.soap.byConsultation(consultationId),
  }),
  detail: (id: string) => ({
    queryKey: [...queryKeys.soap.byConsultation(""), "detail", id] as const,
  }),
};

export const transcriptQueries = {
  byConsultation: (consultationId: string) => ({
    queryKey: queryKeys.transcripts.byConsultation(consultationId),
  }),
};
