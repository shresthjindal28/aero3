import { apiClient } from "@/lib/api/client";

export async function retryAiJob(jobId: string): Promise<unknown> {
  const { data } = await apiClient.patch(`/ai-jobs/${jobId}/retry`);
  return data;
}
