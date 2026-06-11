import { queryKeys } from "@/shared/constants/query-keys";

export const memoryQueries = {
  profile: (patientId: string) => ({
    queryKey: queryKeys.memory.profile(patientId),
  }),
  documents: (patientId: string) => ({
    queryKey: queryKeys.memory.documents(patientId),
  }),
  context: (patientId: string, consultationId?: string) => ({
    queryKey: queryKeys.memory.context(patientId, consultationId),
  }),
  search: (patientId: string, query: string) => ({
    queryKey: queryKeys.memory.search(patientId, query),
  }),
};
