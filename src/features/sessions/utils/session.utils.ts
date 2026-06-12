export function formatElapsedMs(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function formatSegmentTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function formatSpeaker(provider: string): string {
  return "Transcript";
}

const SESSION_STATUS_LABELS: Record<string, string> = {
  active: "In progress",
  paused: "Paused",
  ended: "Ended",
  failed: "Failed",
};

export function formatSessionStatus(status: string): string {
  return SESSION_STATUS_LABELS[status] ?? status;
}

type TranscriptPlaceholderInput = {
  sessionStatus: string;
  recordingState: string;
  chunksUploaded: number;
  lastChunkNumber: number;
};

export function getTranscriptPlaceholderMessage({
  sessionStatus,
  recordingState,
  chunksUploaded,
  lastChunkNumber,
}: TranscriptPlaceholderInput): string {
  const hasAudio = chunksUploaded > 0 || lastChunkNumber > 0;

  if (sessionStatus === "ended" && !hasAudio) {
    return "No audio was captured during this visit. Start a new session and allow microphone access before ending the visit.";
  }

  if (sessionStatus === "ended" && hasAudio) {
    return "Your recording is being processed. The transcript will appear here shortly.";
  }

  if (recordingState === "recording" && !hasAudio) {
    return "Listening… your transcript will appear here as you speak with the patient.";
  }

  if (recordingState === "paused") {
    return "Recording is paused. Tap Resume to continue capturing this visit.";
  }

  if (recordingState === "idle" || recordingState === "stopped") {
    return "Preparing to record this visit… allow microphone access when prompted.";
  }

  return "Your live transcript will appear here as the visit is recorded.";
}
