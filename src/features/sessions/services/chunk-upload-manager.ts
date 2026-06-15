import { getMissingChunks, registerAudioChunk } from "@/features/sessions/api/audio-chunks.api";
import { uploadSessionChunk } from "@/features/sessions/api/storage.api";
import { sessionConfig } from "@/features/sessions/config/session.config";
import type { ChunkRecord } from "@/features/sessions/types/audio-chunk.types";
import { computeSha256Hex } from "@/features/sessions/utils/checksum";
import { PriorityQueue } from "@/features/sessions/utils/priority-queue";
import { Queue } from "@/features/sessions/utils/queue";
import type { ApiError } from "@/lib/api/types/api-error.types";

type ChunkUploadTask = {
  chunkNumber: number;
  blob: Blob;
  durationMs: number;
  retryCount: number;
};

type ChunkUploadManagerOptions = {
  sessionId: string;
  consultationId: string;
  onMetricsChange: (metrics: {
    uploaded: number;
    pending: number;
    failed: number;
  }) => void;
  onBackpressure: (paused: boolean) => void;
};

export class ChunkUploadManager {
  private readonly pendingQueue = new Queue<ChunkUploadTask>();
  private readonly retryQueue = new PriorityQueue<ChunkUploadTask>();
  private readonly chunkMap = new Map<number, ChunkRecord>();
  private readonly options: ChunkUploadManagerOptions;
  private activeUploads = 0;
  private processing = false;
  private paused = false;
  private uploadedCount = 0;
  private failedCount = 0;
  private halted = false;

  constructor(options: ChunkUploadManagerOptions) {
    this.options = options;
  }

  halt(): void {
    this.halted = true;
    this.pendingQueue.clear();
  }

  enqueue(chunk: Omit<ChunkUploadTask, "retryCount">): void {
    const record: ChunkRecord = {
      chunkNumber: chunk.chunkNumber,
      state: "queued",
      retryCount: 0,
      blob: chunk.blob,
      durationMs: chunk.durationMs,
    };

    this.chunkMap.set(chunk.chunkNumber, record);
    this.pendingQueue.enqueue({ ...chunk, retryCount: 0 });
    this.emitMetrics();
    this.applyBackpressure();
    void this.process();
  }

  async flush(): Promise<void> {
    while (this.pendingQueue.size() > 0 || this.retryQueue.size() > 0 || this.activeUploads > 0) {
      await this.process();
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  async recoverMissing(): Promise<void> {
    const { missing_chunks: missing } = await getMissingChunks(
      this.options.sessionId,
    );

    for (const chunkNumber of missing) {
      const record = this.chunkMap.get(chunkNumber);
      if (!record?.blob) continue;

      record.state = "queued";
      this.retryQueue.enqueue(
        {
          chunkNumber,
          blob: record.blob,
          durationMs: record.durationMs,
          retryCount: record.retryCount,
        },
        record.retryCount,
      );
    }

    this.emitMetrics();
    void this.process();
  }

  getChunkMap(): ReadonlyMap<number, ChunkRecord> {
    return this.chunkMap;
  }

  private async process(): Promise<void> {
    if (this.processing || this.halted) return;
    this.processing = true;

    try {
      while (
        this.activeUploads < sessionConfig.maxConcurrentUploads &&
        (!this.retryQueue.isEmpty() || !this.pendingQueue.isEmpty())
      ) {
        const task =
          this.retryQueue.dequeue() ?? this.pendingQueue.dequeue() ?? null;
        if (!task) break;

        this.activeUploads += 1;
        void this.uploadTask(task).finally(() => {
          this.activeUploads -= 1;
          void this.process();
        });
      }
    } finally {
      this.processing = false;
    }
  }

  private async uploadTask(task: ChunkUploadTask): Promise<void> {
    const record = this.chunkMap.get(task.chunkNumber);
    if (!record || this.halted) return;

    record.state = "uploading";
    this.emitMetrics();

    try {
      const checksum = await computeSha256Hex(task.blob);
      const fileName = `chunk_${task.chunkNumber}.webm`;
      const upload = await uploadSessionChunk(
        {
          resource_type: "audio_chunk",
          session_id: this.options.sessionId,
          file_name: fileName,
        },
        task.blob,
      );

      await registerAudioChunk({
        session_id: this.options.sessionId,
        consultation_id: this.options.consultationId,
        chunk_number: task.chunkNumber,
        duration_ms: task.durationMs,
        object_key: upload.object_key,
        checksum,
        mime_type: upload.content_type,
        client_timestamp: new Date().toISOString(),
      });

      record.state = "uploaded";
      record.blob = undefined;
      this.uploadedCount += 1;
      this.emitMetrics();
      this.applyBackpressure();
    } catch (error) {
      const apiError = error as ApiError;
      const message = apiError.message ?? "";

      if (message.includes("Session must be active")) {
        record.state = "failed";
        this.failedCount += 1;
        this.emitMetrics();
        return;
      }

      record.retryCount += 1;

      if (record.retryCount >= sessionConfig.maxUploadRetries) {
        record.state = "failed";
        this.failedCount += 1;
        this.emitMetrics();
        return;
      }

      record.state = "queued";
      this.retryQueue.enqueue(
        {
          ...task,
          retryCount: record.retryCount,
        },
        record.retryCount,
      );
      this.emitMetrics();

      await new Promise((resolve) =>
        setTimeout(
          resolve,
          sessionConfig.retryBaseDelayMs * record.retryCount,
        ),
      );
    }
  }

  private emitMetrics(): void {
    const pending = Array.from(this.chunkMap.values()).filter(
      (record) => record.state === "queued" || record.state === "uploading",
    ).length;

    this.options.onMetricsChange({
      uploaded: this.uploadedCount,
      pending,
      failed: this.failedCount,
    });
  }

  private applyBackpressure(): void {
    const isPressured =
      this.pendingQueue.size() + this.retryQueue.size() >=
      sessionConfig.uploadBackpressureThreshold;

    if (isPressured !== this.paused) {
      this.paused = isPressured;
      this.options.onBackpressure(isPressured);
    }
  }
}
