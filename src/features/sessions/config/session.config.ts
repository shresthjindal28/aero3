export const sessionConfig = {
  chunkDurationMs: 5_000,
  maxConcurrentUploads: 2,
  maxUploadRetries: 5,
  retryBaseDelayMs: 1_000,
  transcriptBufferCapacity: 500,
  uploadBackpressureThreshold: 20,
  mimeType: "audio/webm",
} as const;
