export const sessionConfig = {
  chunkDurationMs: 2_000,
  maxConcurrentUploads: 3,
  maxUploadRetries: 5,
  retryBaseDelayMs: 1_000,
  transcriptBufferCapacity: 500,
  uploadBackpressureThreshold: 20,
  mimeType: "audio/webm",
} as const;
