import type { AiJob } from "@/features/soap/types/ai-job.types";
import { apiClient } from "@/lib/api/client";

export async function getAiJob(jobId: string): Promise<AiJob> {
  const { data } = await apiClient.get<AiJob>(`/ai-jobs/${jobId}`);
  return data;
}
