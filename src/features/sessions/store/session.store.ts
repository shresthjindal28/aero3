import { create } from "zustand";

import type { ConnectionDisplayStatus } from "@/features/sessions/services/session-realtime.service";
import type { RecordingState } from "@/features/sessions/services/audio-recorder.service";
import type { TranscriptSegment } from "@/features/sessions/types/transcript.types";

export type MicPermission = "granted" | "denied" | "prompt" | "unknown";

type SessionStoreState = {
  recordingState: RecordingState;
  connectionStatus: ConnectionDisplayStatus;
  micPermission: MicPermission;
  elapsedMs: number;
  chunksUploaded: number;
  chunksPending: number;
  chunksFailed: number;
  transcriptSegments: TranscriptSegment[];
  transcriptSegmentCount: number;
  autoScrollEnabled: boolean;
  uploadBackpressure: boolean;
  sessionError: string | null;
  setRecordingState: (state: RecordingState) => void;
  setConnectionStatus: (status: ConnectionDisplayStatus) => void;
  setMicPermission: (permission: MicPermission) => void;
  setElapsedMs: (elapsedMs: number) => void;
  setChunkMetrics: (metrics: {
    uploaded: number;
    pending: number;
    failed: number;
  }) => void;
  setTranscriptSegments: (segments: TranscriptSegment[]) => void;
  setTranscriptSegmentCount: (count: number) => void;
  setAutoScrollEnabled: (enabled: boolean) => void;
  setUploadBackpressure: (paused: boolean) => void;
  setSessionError: (error: string | null) => void;
  reset: () => void;
};

const initialState = {
  recordingState: "idle" as RecordingState,
  connectionStatus: "disconnected" as ConnectionDisplayStatus,
  micPermission: "unknown" as MicPermission,
  elapsedMs: 0,
  chunksUploaded: 0,
  chunksPending: 0,
  chunksFailed: 0,
  transcriptSegments: [] as TranscriptSegment[],
  transcriptSegmentCount: 0,
  autoScrollEnabled: true,
  uploadBackpressure: false,
  sessionError: null as string | null,
};

export const useSessionStore = create<SessionStoreState>((set) => ({
  ...initialState,
  setRecordingState: (recordingState) => set({ recordingState }),
  setConnectionStatus: (connectionStatus) => set({ connectionStatus }),
  setMicPermission: (micPermission) => set({ micPermission }),
  setElapsedMs: (elapsedMs) => set({ elapsedMs }),
  setChunkMetrics: ({ uploaded, pending, failed }) =>
    set({
      chunksUploaded: uploaded,
      chunksPending: pending,
      chunksFailed: failed,
    }),
  setTranscriptSegments: (transcriptSegments) => set({ transcriptSegments }),
  setTranscriptSegmentCount: (transcriptSegmentCount) =>
    set({ transcriptSegmentCount }),
  setAutoScrollEnabled: (autoScrollEnabled) => set({ autoScrollEnabled }),
  setUploadBackpressure: (uploadBackpressure) => set({ uploadBackpressure }),
  setSessionError: (sessionError) => set({ sessionError }),
  reset: () => set(initialState),
}));
