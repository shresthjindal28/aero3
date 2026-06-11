import { queryKeys } from "@/shared/constants/query-keys";

export const transcriptQueries = {
  byConsultation: (consultationId: string) => ({
    queryKey: queryKeys.transcripts.byConsultation(consultationId),
  }),
  segments: (sessionId: string) => ({
    queryKey: queryKeys.transcripts.segments(sessionId),
  }),
};
