import type { ConsultationTranscript } from "@/features/soap/types/transcript.types";
import { apiClient } from "@/lib/api/client";

export async function getTranscriptByConsultation(
  consultationId: string,
): Promise<ConsultationTranscript> {
  const { data } = await apiClient.get<ConsultationTranscript>(
    `/transcripts/by-consultation/${consultationId}`,
  );
  return data;
}
