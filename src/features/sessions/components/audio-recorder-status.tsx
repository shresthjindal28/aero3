import { AlertCircle, Mic, MicOff, PauseCircle } from "lucide-react";

import type { RecordingState } from "@/features/sessions/services/audio-recorder.service";
import type { MicPermission } from "@/features/sessions/store/session.store";
import { cn } from "@/lib/utils/cn";

type AudioRecorderStatusProps = {
  recordingState: RecordingState;
  micPermission: MicPermission;
  uploadBackpressure: boolean;
};

const stateLabels: Record<RecordingState, string> = {
  idle: "Not recording",
  recording: "Recording visit audio",
  paused: "Recording paused",
  stopped: "Recording stopped",
};

export function AudioRecorderStatus({
  recordingState,
  micPermission,
  uploadBackpressure,
}: AudioRecorderStatusProps) {
  const isRecording = recordingState === "recording";

  return (
    <div className="space-y-3 rounded-xl border border-border/60 bg-card/50 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Audio status</h3>
        <span
          className={cn(
            "inline-flex h-2.5 w-2.5 rounded-full",
            isRecording ? "animate-pulse bg-red-500" : "bg-muted-foreground/40",
          )}
        />
      </div>

      <div className="flex items-center gap-2 text-sm">
        {micPermission === "denied" ? (
          <MicOff className="h-4 w-4 text-red-400" />
        ) : recordingState === "paused" ? (
          <PauseCircle className="h-4 w-4 text-amber-400" />
        ) : (
          <Mic
            className={cn(
              "h-4 w-4",
              isRecording ? "text-red-400" : "text-muted-foreground",
            )}
          />
        )}
        <span>{stateLabels[recordingState]}</span>
      </div>

      {micPermission === "denied" ? (
        <p className="flex items-start gap-2 text-xs text-red-400">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Microphone access denied. Enable it in browser settings.
        </p>
      ) : null}

      {uploadBackpressure ? (
        <p className="text-xs text-amber-400">
          Upload queue is full — chunking paused until backlog clears.
        </p>
      ) : null}
    </div>
  );
}
