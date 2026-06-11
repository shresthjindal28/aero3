import type { TranscriptSegment } from "@/features/sessions/types/transcript.types";
import { apiClient } from "@/lib/api/client";

export async function listTranscriptSegments(
  sessionId: string,
): Promise<TranscriptSegment[]> {
  const { data } = await apiClient.get<TranscriptSegment[]>(
    `/transcript-segments/sessions/${sessionId}/segments`,
  );
  return data;
}
