import type {
  AudioChunk,
  AudioChunkCreateInput,
  MissingChunksResponse,
} from "@/features/sessions/types/audio-chunk.types";
import { apiClient } from "@/lib/api/client";

export async function registerAudioChunk(
  input: AudioChunkCreateInput,
): Promise<AudioChunk> {
  const { data } = await apiClient.post<AudioChunk>("/audio-chunks", input);
  return data;
}

export async function getMissingChunks(
  sessionId: string,
): Promise<MissingChunksResponse> {
  const { data } = await apiClient.get<MissingChunksResponse>(
    `/audio-chunks/session/${sessionId}/missing`,
  );
  return data;
}
