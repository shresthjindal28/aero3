"use client";

import { AiCopilotPanel } from "@/shared/copilot/ai-copilot-panel";
import { Button } from "@/shared/ui/primitives/button";
import { Bot, ChevronLeft } from "lucide-react";

type AiAssistantPanelProps = {
  expanded: boolean;
  onToggle: () => void;
  patientId?: string;
  consultationId?: string;
};

export function AiAssistantPanel({
  expanded,
  onToggle,
  patientId,
  consultationId,
}: AiAssistantPanelProps) {
  if (!expanded) {
    return (
      <aside className="flex w-11 shrink-0 flex-col items-center border-l bg-muted/20 py-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onToggle}
          aria-label="Open AI Assistant"
          title="AI Assistant"
        >
          <Bot className="h-4 w-4" />
        </Button>
      </aside>
    );
  }

  return (
    <aside className="flex w-80 shrink-0 flex-col border-l bg-background xl:w-96">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">AI Assistant</h2>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onToggle}
          aria-label="Close AI Assistant"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
      <div className="min-h-0 flex-1">
        <AiCopilotPanel
          variant="embedded"
          className="h-full rounded-none border-0"
          patientId={patientId}
          consultationId={consultationId}
        />
      </div>
    </aside>
  );
}
