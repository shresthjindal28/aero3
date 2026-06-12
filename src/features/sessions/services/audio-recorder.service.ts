import { sessionConfig } from "@/features/sessions/config/session.config";

export type RecordingState = "idle" | "recording" | "paused" | "stopped";

export type AudioChunkPayload = {
  blob: Blob;
  chunkNumber: number;
  durationMs: number;
};

type AudioRecorderCallbacks = {
  onChunk: (chunk: AudioChunkPayload) => void;
  onStateChange: (state: RecordingState) => void;
  onError: (error: Error) => void;
};

export class AudioRecorderService {
  private stream: MediaStream | null = null;
  private chunkNumber = 0;
  private state: RecordingState = "idle";
  private callbacks: AudioRecorderCallbacks | null = null;
  private readonly chunkDurationMs: number;
  private loopActive = false;
  private loopRunning = false;
  private paused = false;
  private activeRecorder: MediaRecorder | null = null;
  private chunkTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(chunkDurationMs = sessionConfig.chunkDurationMs) {
    this.chunkDurationMs = chunkDurationMs;
  }

  getState(): RecordingState {
    return this.state;
  }

  getNextChunkNumber(): number {
    return this.chunkNumber + 1;
  }

  setChunkNumber(value: number): void {
    this.chunkNumber = value;
  }

  async requestPermission(): Promise<PermissionState> {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("Audio recording is not supported in this browser");
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
    const permission = await navigator.permissions.query({
      name: "microphone" as PermissionName,
    });
    return permission.state;
  }

  async start(callbacks: AudioRecorderCallbacks, initialChunkNumber = 0): Promise<void> {
    if (this.state === "recording" || this.loopActive) return;

    this.callbacks = callbacks;
    this.chunkNumber = initialChunkNumber;
    this.paused = false;
    this.loopActive = true;

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      this.setState("recording");
      void this.runRecordingLoop();
    } catch (error) {
      this.loopActive = false;
      this.cleanupStream();
      const message =
        error instanceof DOMException && error.name === "NotAllowedError"
          ? "Microphone permission denied"
          : "Failed to start audio recording";
      this.callbacks?.onError(new Error(message));
      throw error;
    }
  }

  pause(): void {
    if (!this.loopActive || this.paused) return;
    this.paused = true;
    this.clearChunkTimer();
    if (this.activeRecorder?.state === "recording") {
      this.activeRecorder.stop();
    }
    this.setState("paused");
  }

  resume(): void {
    if (!this.loopActive || !this.paused) return;
    this.paused = false;
    this.setState("recording");
    void this.runRecordingLoop();
  }

  async stop(): Promise<void> {
    this.loopActive = false;
    this.paused = false;
    this.clearChunkTimer();

    if (this.activeRecorder && this.activeRecorder.state !== "inactive") {
      await new Promise<void>((resolve) => {
        const recorder = this.activeRecorder;
        if (!recorder) {
          resolve();
          return;
        }
        recorder.addEventListener("stop", () => resolve(), { once: true });
        recorder.stop();
      });
    }

    this.activeRecorder = null;
    this.cleanupStream();
    this.setState("stopped");
  }

  dispose(): void {
    void this.stop();
    this.callbacks = null;
  }

  private async runRecordingLoop(): Promise<void> {
    if (this.loopRunning) return;

    this.loopRunning = true;
    try {
      await this.captureChunks();
    } finally {
      this.loopRunning = false;
    }
  }

  private async captureChunks(): Promise<void> {
    while (this.loopActive && !this.paused && this.stream) {
      try {
        const blob = await this.recordSingleChunk();
        if (!this.loopActive || this.paused || !blob || blob.size === 0) {
          continue;
        }

        this.chunkNumber += 1;
        this.callbacks?.onChunk({
          blob,
          chunkNumber: this.chunkNumber,
          durationMs: this.chunkDurationMs,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Audio recording failed";
        this.callbacks?.onError(new Error(message));
        break;
      }
    }
  }


  /**
   * Record one self-contained WebM file per chunk. MediaRecorder timeslice
   * fragments are not valid standalone files for STT providers — each chunk
   * must be started and stopped independently.
   */
  private recordSingleChunk(): Promise<Blob | null> {
    return new Promise((resolve, reject) => {
      if (!this.stream) {
        resolve(null);
        return;
      }

      const mimeType = MediaRecorder.isTypeSupported(sessionConfig.mimeType)
        ? sessionConfig.mimeType
        : "audio/webm";

      const recorder = new MediaRecorder(this.stream, { mimeType });
      const parts: Blob[] = [];
      this.activeRecorder = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          parts.push(event.data);
        }
      };

      recorder.onerror = () => {
        reject(new Error("MediaRecorder encountered an error"));
      };

      recorder.onstop = () => {
        this.activeRecorder = null;
        this.clearChunkTimer();
        if (!parts.length) {
          resolve(null);
          return;
        }
        resolve(new Blob(parts, { type: mimeType }));
      };

      recorder.start();
      this.chunkTimer = setTimeout(() => {
        if (recorder.state !== "inactive") {
          recorder.stop();
        }
      }, this.chunkDurationMs);
    });
  }

  private clearChunkTimer(): void {
    if (this.chunkTimer) {
      clearTimeout(this.chunkTimer);
      this.chunkTimer = null;
    }
  }

  private setState(state: RecordingState): void {
    this.state = state;
    this.callbacks?.onStateChange(state);
  }

  private cleanupStream(): void {
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
  }
}
