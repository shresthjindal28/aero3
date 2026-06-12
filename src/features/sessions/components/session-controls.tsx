import { Pause, Play, Square } from "lucide-react";

import { Button } from "@/shared/ui/primitives/button";

type SessionControlsProps = {
  canPause: boolean;
  canResume: boolean;
  canEnd: boolean;
  isEnding: boolean;
  onPause: () => void;
  onResume: () => void;
  onEnd: () => void;
};

export function SessionControls({
  canPause,
  canResume,
  canEnd,
  isEnding,
  onPause,
  onResume,
  onEnd,
}: SessionControlsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={onPause} disabled={!canPause}>
        <Pause className="h-4 w-4" />
        Pause
      </Button>
      <Button variant="outline" onClick={onResume} disabled={!canResume}>
        <Play className="h-4 w-4" />
        Resume
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
