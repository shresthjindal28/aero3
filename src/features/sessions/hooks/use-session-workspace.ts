"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";

import { sessionConfig } from "@/features/sessions/config/session.config";
import {
  useEndSession,
  usePauseSession,
  useResumeSession,
} from "@/features/sessions/hooks/use-session-mutations";
import { useSession } from "@/features/sessions/hooks/use-session";
import { AudioRecorderService } from "@/features/sessions/services/audio-recorder.service";
import { ChunkUploadManager } from "@/features/sessions/services/chunk-upload-manager";
import { SessionRealtimeService } from "@/features/sessions/services/session-realtime.service";
import { TranscriptSyncService } from "@/features/sessions/services/transcript-sync.service";
import { useSessionStore } from "@/features/sessions/store/session.store";
import { TranscriptRingBuffer } from "@/features/sessions/utils/transcript-ring-buffer";
import { useConsultation } from "@/features/consultations/hooks/use-consultation";
import { usePatient } from "@/features/patients/hooks/use-patient";
import { useTokenStore } from "@/features/auth/store/token.store";

export function useSessionWorkspace(sessionId: string) {
  const { data: session, isLoading: sessionLoading, error: sessionError } =
    useSession(sessionId);
  const consultationId = session?.consultation_id ?? "";
  const { data: consultation, isLoading: consultationLoading } =
    useConsultation(consultationId, Boolean(consultationId));
  const { data: patient, isLoading: patientLoading } = usePatient(
    consultation?.patient_id ?? "",
    Boolean(consultation?.patient_id),
  );

  const pauseMutation = usePauseSession(sessionId);
  const resumeMutation = useResumeSession(sessionId);
  const endMutation = useEndSession(sessionId);

  const recorderRef = useRef<AudioRecorderService | null>(null);
  const uploadManagerRef = useRef<ChunkUploadManager | null>(null);
  const realtimeRef = useRef<SessionRealtimeService | null>(null);
  const transcriptSyncRef = useRef<TranscriptSyncService | null>(null);
  const elapsedAnchorRef = useRef<number | null>(null);
  const pausedAccumulatedRef = useRef(0);
  const pauseStartedAtRef = useRef<number | null>(null);

  const {
    recordingState,
    connectionStatus,
    micPermission,
    elapsedMs,
    chunksUploaded,
    chunksPending,
    chunksFailed,
    transcriptSegments,
    transcriptSegmentCount,
    autoScrollEnabled,
    uploadBackpressure,
    sessionError: workspaceError,
    setRecordingState,
    setConnectionStatus,
    setMicPermission,
    setElapsedMs,
    setChunkMetrics,
    setTranscriptSegments,
    setTranscriptSegmentCount,
    setUploadBackpressure,
    setSessionError,
    reset,
  } = useSessionStore();

  const refreshTranscript = useCallback(() => {
    const sync = transcriptSyncRef.current;
    if (!sync) return;
    setTranscriptSegments(sync.getSegments());
    setTranscriptSegmentCount(sync.segmentCount);
  }, [setTranscriptSegmentCount, setTranscriptSegments]);

  useEffect(() => {
    reset();
    const buffer = new TranscriptRingBuffer(sessionConfig.transcriptBufferCapacity);
    transcriptSyncRef.current = new TranscriptSyncService(buffer);
    recorderRef.current = new AudioRecorderService();

    return () => {
      recorderRef.current?.dispose();
      uploadManagerRef.current = null;
      realtimeRef.current?.disconnect();
      realtimeRef.current = null;
      reset();
    };
  }, [reset, sessionId]);

  useEffect(() => {
    if (!session || !consultation) return;

    const token = useTokenStore.getState().accessToken;
    if (!token) {
      setSessionError("Authentication required for live session");
      return;
    }

    uploadManagerRef.current = new ChunkUploadManager({
      sessionId: session.id,
      consultationId: session.consultation_id,
      onMetricsChange: setChunkMetrics,
      onBackpressure: setUploadBackpressure,
    });

    const realtime = new SessionRealtimeService(
      session.id,
      token,
      transcriptSyncRef.current!,
      {
        onConnectionChange: setConnectionStatus,
        onSegmentsChange: refreshTranscript,
        onFinalized: () => refreshTranscript(),
        onRecover: async () => {
          await uploadManagerRef.current?.recoverMissing();
        },
      },
    );

    realtimeRef.current = realtime;
    realtime.connect();

    return () => {
      realtime.disconnect();
    };
  }, [
    consultation,
    refreshTranscript,
    session,
    setChunkMetrics,
    setConnectionStatus,
    setSessionError,
    setUploadBackpressure,
  ]);

  useEffect(() => {
    if (!session?.started_at) return;

    elapsedAnchorRef.current = new Date(session.started_at).getTime();

    const interval = setInterval(() => {
      if (!elapsedAnchorRef.current) return;
      if (session.status === "paused" && pauseStartedAtRef.current) return;
      if (session.status === "ended") return;

      const now = Date.now();
      const pausedMs = pausedAccumulatedRef.current;
      setElapsedMs(now - elapsedAnchorRef.current - pausedMs);
    }, 1000);

    return () => clearInterval(interval);
  }, [session?.started_at, session?.status, setElapsedMs]);

  useEffect(() => {
    if (session?.status === "paused" && !pauseStartedAtRef.current) {
      pauseStartedAtRef.current = Date.now();
    }

    if (session?.status === "active" && pauseStartedAtRef.current) {
      pausedAccumulatedRef.current += Date.now() - pauseStartedAtRef.current;
      pauseStartedAtRef.current = null;
    }
  }, [session?.status]);

  const startRecording = useCallback(async () => {
    if (!session || session.status === "ended") {
      setSessionError("Session is no longer active");
      return;
    }

    const recorder = recorderRef.current;
    const uploadManager = uploadManagerRef.current;
    if (!recorder || !uploadManager) return;

    try {
      const permission = await recorder.requestPermission();
      setMicPermission(permission === "granted" ? "granted" : "prompt");

      await recorder.start(
        {
          onChunk: (chunk) => {
            uploadManager.enqueue(chunk);
          },
          onStateChange: setRecordingState,
          onError: (error) => setSessionError(error.message),
        },
        session.last_chunk_number,
      );
    } catch {
      setMicPermission("denied");
      setSessionError("Microphone permission denied");
    }
  }, [
    session,
    setMicPermission,
    setRecordingState,
    setSessionError,
  ]);

  const pauseRecording = useCallback(async () => {
    recorderRef.current?.pause();
    if (session?.status === "active") {
      await pauseMutation.mutateAsync();
    }
  }, [pauseMutation, session?.status]);

  const resumeRecording = useCallback(async () => {
    if (session?.status === "paused") {
      await resumeMutation.mutateAsync();
    }
    recorderRef.current?.resume();
  }, [resumeMutation, session?.status]);

  const endSessionAction = useCallback(async () => {
    await recorderRef.current?.stop();
    await uploadManagerRef.current?.flush();
    await endMutation.mutateAsync();
    realtimeRef.current?.disconnect();
  }, [endMutation]);

  const controls = useMemo(
    () => ({
      canStart:
        session?.status !== "ended" &&
        recordingState !== "recording" &&
        recordingState !== "paused",
      canPause:
        session?.status === "active" && recordingState === "recording",
      canResume:
        (session?.status === "paused" || recordingState === "paused") &&
        session?.status !== "ended",
      canEnd: session?.status !== "ended",
      isEnding: endMutation.isPending,
    }),
    [endMutation.isPending, recordingState, session?.status],
  );

  return {
    session,
    consultation,
    patient,
    isLoading: sessionLoading || consultationLoading || patientLoading,
    error: sessionError,
    sessionError: workspaceError,
    recordingState,
    connectionStatus,
    micPermission,
    elapsedMs,
    chunksUploaded,
    chunksPending,
    chunksFailed,
    transcriptSegments,
    transcriptSegmentCount,
    autoScrollEnabled,
    uploadBackpressure,
    controls,
    startRecording,
    pauseRecording,
    resumeRecording,
    endSession: endSessionAction,
    setAutoScrollEnabled: useSessionStore.getState().setAutoScrollEnabled,
  };
}
