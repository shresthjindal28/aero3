import { Mic } from "lucide-react";

import type { RecordingState } from "@/features/sessions/services/audio-recorder.service";
import type { Session } from "@/features/sessions/types/session.types";
import { Button } from "@/shared/ui/primitives/button";

type SessionRecordingBannerProps = {
  session: Session;
  recordingState: RecordingState;
  chunksUploaded: number;
  onStartRecording: () => void;
};

export function SessionRecordingBanner({
  session,
  recordingState,
  chunksUploaded,
  onStartRecording,
}: SessionRecordingBannerProps) {
  const needsRecording =
    session.status !== "ended" &&
    (recordingState === "idle" || recordingState === "stopped") &&
    chunksUploaded === 0 &&
    session.last_chunk_number === 0;

  if (!needsRecording) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium text-amber-100">Recording not started</p>
        <p className="mt-1 text-sm text-amber-100/80">
          Start recording to capture this visit. Without audio, no transcript will be
          generated.
        </p>
      </div>
      <Button type="button" onClick={onStartRecording} className="shrink-0">
        <Mic className="h-4 w-4" />
        Start recording
      </Button>
    </div>
  );
}
