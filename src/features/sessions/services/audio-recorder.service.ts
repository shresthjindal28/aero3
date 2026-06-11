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
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private chunkNumber = 0;
  private state: RecordingState = "idle";
  private callbacks: AudioRecorderCallbacks | null = null;
  private readonly chunkDurationMs: number;

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
    if (this.state === "recording") return;

    this.callbacks = callbacks;
    this.chunkNumber = initialChunkNumber;

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      const mimeType = MediaRecorder.isTypeSupported(sessionConfig.mimeType)
        ? sessionConfig.mimeType
        : "audio/webm";

      this.mediaRecorder = new MediaRecorder(this.stream, { mimeType });
      this.mediaRecorder.ondataavailable = (event) => {
        if (!event.data || event.data.size === 0) return;

        this.chunkNumber += 1;
        this.callbacks?.onChunk({
          blob: event.data,
          chunkNumber: this.chunkNumber,
          durationMs: this.chunkDurationMs,
        });
      };

      this.mediaRecorder.onerror = () => {
        this.callbacks?.onError(new Error("MediaRecorder encountered an error"));
      };

      this.mediaRecorder.start(this.chunkDurationMs);
      this.setState("recording");
    } catch (error) {
      this.cleanup();
      const message =
        error instanceof DOMException && error.name === "NotAllowedError"
          ? "Microphone permission denied"
          : "Failed to start audio recording";
      this.callbacks?.onError(new Error(message));
      throw error;
    }
  }

  pause(): void {
    if (this.mediaRecorder?.state === "recording") {
      this.mediaRecorder.pause();
      this.setState("paused");
    }
  }

  resume(): void {
    if (this.mediaRecorder?.state === "paused") {
      this.mediaRecorder.resume();
      this.setState("recording");
    }
  }

  async stop(): Promise<void> {
    if (!this.mediaRecorder) {
      this.setState("stopped");
      return;
    }

    await new Promise<void>((resolve) => {
      const recorder = this.mediaRecorder;
      if (!recorder) {
        resolve();
        return;
      }

      recorder.addEventListener(
        "stop",
        () => {
          resolve();
        },
        { once: true },
      );

      if (recorder.state !== "inactive") {
        recorder.stop();
      } else {
        resolve();
      }
    });

    this.cleanup();
    this.setState("stopped");
  }

  dispose(): void {
    void this.stop();
    this.callbacks = null;
  }

  private setState(state: RecordingState): void {
    this.state = state;
    this.callbacks?.onStateChange(state);
  }

  private cleanup(): void {
    this.mediaRecorder = null;
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
  }
}
