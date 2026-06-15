"use client";

import { AiCopilotPanel } from "@/shared/copilot/ai-copilot-panel";
import { Sheet, SheetContent, SheetTitle } from "@/shared/ui/primitives/sheet";

type AiAssistantDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId?: string;
  consultationId?: string;
};

export function AiAssistantDrawer({
  open,
  onOpenChange,
  patientId,
  consultationId,
}: AiAssistantDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-md p-0">
        <SheetTitle className="sr-only">AI Assistant</SheetTitle>
        <AiCopilotPanel
          variant="embedded"
          className="h-full rounded-none border-0"
          patientId={patientId}
          consultationId={consultationId}
        />
      </SheetContent>
    </Sheet>
  );
}
