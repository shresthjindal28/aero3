export type ChunkStatus =
  | "pending"
  | "uploaded"
  | "processing"
  | "processed"
  | "failed";

export type AudioChunk = {
  id: string;
  session_id: string;
  consultation_id: string;
  chunk_number: number;
  duration_ms: number;
  object_key: string;
  checksum: string;
  mime_type: string;
  status: ChunkStatus;
  client_timestamp: string;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AudioChunkCreateInput = {
  session_id: string;
  consultation_id: string;
  chunk_number: number;
  duration_ms: number;
  object_key: string;
  checksum: string;
  mime_type: string;
  client_timestamp: string;
};

export type MissingChunksResponse = {
  missing_chunks: number[];
};

export type ChunkUploadState =
  | "queued"
  | "uploading"
  | "uploaded"
  | "failed";

export type ChunkRecord = {
  chunkNumber: number;
  state: ChunkUploadState;
  retryCount: number;
  blob?: Blob;
  durationMs: number;
};
