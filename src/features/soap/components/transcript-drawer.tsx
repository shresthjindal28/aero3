"use client";

import { TranscriptPanel } from "@/features/soap/components/transcript-panel";
import type { ConsultationTranscript } from "@/features/soap/types/transcript.types";
import { Sheet, SheetContent, SheetTitle } from "@/shared/ui/primitives/sheet";

type TranscriptDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transcript: ConsultationTranscript | null | undefined;
  isLoading: boolean;
  isMissing: boolean;
  onRetry?: () => void;
};

export function TranscriptDrawer({
  open,
  onOpenChange,
  transcript,
  isLoading,
  isMissing,
  onRetry,
}: TranscriptDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-lg p-0">
        <SheetTitle className="sr-only">Consultation transcript</SheetTitle>
        <TranscriptPanel
          transcript={transcript}
          isLoading={isLoading}
          isMissing={isMissing}
          collapsed={false}
          expanded
          onToggleCollapsed={() => onOpenChange(false)}
          onToggleExpanded={() => undefined}
          onRetry={onRetry}
        />
      </SheetContent>
    </Sheet>
  );
}
