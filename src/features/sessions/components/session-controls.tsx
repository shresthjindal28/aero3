import { Mic, Pause, Play, Square } from "lucide-react";

import { Button } from "@/shared/ui/primitives/button";

type SessionControlsProps = {
  canStart: boolean;
  canPause: boolean;
  canResume: boolean;
  canEnd: boolean;
  isEnding: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onEnd: () => void;
};

export function SessionControls({
  canStart,
  canPause,
  canResume,
  canEnd,
  isEnding,
  onStart,
  onPause,
  onResume,
  onEnd,
}: SessionControlsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={onStart} disabled={!canStart}>
        <Mic className="h-4 w-4" />
        Start recording
      </Button>
      <Button variant="outline" onClick={onPause} disabled={!canPause}>
        <Pause className="h-4 w-4" />
        Pause recording
      </Button>
      <Button variant="outline" onClick={onResume} disabled={!canResume}>
        <Play className="h-4 w-4" />
        Resume recording
      </Button>
      <Button
        variant="destructive"
        onClick={onEnd}
        disabled={!canEnd || isEnding}
      >
        <Square className="h-4 w-4" />
        End session
      </Button>
    </div>
  );
}
