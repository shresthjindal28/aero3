"use client";

import {
  Activity,
  Brain,
  History,
  Lightbulb,
  Mic,
  Pill,
} from "lucide-react";

import { VoiceAgentPanel } from "@/features/voice-agent/components/voice-agent-panel";
import { cn } from "@/lib/utils/cn";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/primitives/tabs";

type AiCopilotPanelProps = {
  className?: string;
  variant?: "sidebar" | "embedded";
  patientId?: string;
  consultationId?: string;
};

export function AiCopilotPanel({
  className,
  variant = "sidebar",
  patientId,
  consultationId,
}: AiCopilotPanelProps) {
  const hasPatientContext = Boolean(patientId);

  return (
    <aside
      className={cn(
        "flex h-full min-h-0 flex-col border-border/60 bg-card/20",
        variant === "sidebar" && "hidden w-72 shrink-0 border-l xl:flex",
        variant === "embedded" && "border-0",
        className,
      )}
    >
      <div className="border-b border-border/60 px-5 py-4">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <div>
            <h2 className="text-sm font-semibold">Clinical Voice Agent</h2>
            <p className="text-xs text-muted-foreground">
              Memory-aware assistant
            </p>
          </div>
        </div>
      </div>

      {hasPatientContext ? (
        <Tabs defaultValue="voice" className="flex min-h-0 flex-1 flex-col">
          <TabsList className="mx-3 mt-3 grid w-auto grid-cols-2">
            <TabsTrigger value="voice" className="text-xs">
              <Mic className="h-3 w-3" />
              Voice
            </TabsTrigger>
            <TabsTrigger value="memory" className="text-xs">
              <Brain className="h-3 w-3" />
              Memory
            </TabsTrigger>
          </TabsList>

          <TabsContent value="voice" className="mt-0 min-h-0 flex-1">
            <VoiceAgentPanel
              patientId={patientId!}
              consultationId={consultationId}
              className="h-full"
            />
          </TabsContent>

          <TabsContent value="memory" className="mt-0 min-h-0 flex-1 overflow-y-auto p-3">
            <MemoryHints patientId={patientId!} />
          </TabsContent>
        </Tabs>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center text-sm text-muted-foreground">
          <Mic className="h-8 w-8 opacity-50" />
          <p>Open a patient or consultation to use the clinical voice agent.</p>
        </div>
      )}
    </aside>
  );
}

function MemoryHints({ patientId }: { patientId: string }) {
  return (
    <div className="space-y-3 text-xs text-muted-foreground">
      <p className="font-medium text-foreground">Memory sources</p>
      <ul className="space-y-2">
        <li className="flex items-center gap-2">
          <Pill className="h-3.5 w-3.5" />
          Approved prescriptions
        </li>
        <li className="flex items-center gap-2">
          <Lightbulb className="h-3.5 w-3.5" />
          Approved SOAP notes
        </li>
        <li className="flex items-center gap-2">
          <History className="h-3.5 w-3.5" />
          Precomputed timeline
        </li>
      </ul>
      <p>
        Patient context is cached in Redis for sub-second responses. Full memory
        page: <span className="font-mono">/patients/{patientId}/memory</span>
      </p>
    </div>
  );
}
