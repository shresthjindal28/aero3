import { Mic } from "lucide-react";

import { Button } from "@/shared/ui/primitives/button";

type MicAccessBannerProps = {
  onEnableMicrophone: () => void;
};

export function MicAccessBanner({ onEnableMicrophone }: MicAccessBannerProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium text-amber-100">Microphone access needed</p>
        <p className="mt-1 text-sm text-amber-100/80">
          This visit is being recorded automatically. Allow microphone access in your
          browser to capture the consultation.
        </p>
      </div>
      <Button type="button" onClick={onEnableMicrophone} className="shrink-0">
        <Mic className="h-4 w-4" />
        Enable microphone
      </Button>
    </div>
  );
}
