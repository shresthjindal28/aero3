"use client";

import {
  Activity,
  AlertTriangle,
  Brain,
  Lightbulb,
  Pill,
  Sparkles,
  History,
} from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/primitives/tabs";

type AiCopilotPanelProps = {
  className?: string;
  variant?: "sidebar" | "embedded";
};

const tabs = [
  { id: "memory", label: "Memory", icon: Brain },
  { id: "insights", label: "Insights", icon: Lightbulb },
  { id: "medications", label: "Medications", icon: Pill },
  { id: "risk", label: "Risk factors", icon: AlertTriangle },
  { id: "timeline", label: "Timeline", icon: History },
] as const;

function PlaceholderContent({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
      <Sparkles className="h-5 w-5 text-muted-foreground" />
      <p className="text-sm font-medium">{label}</p>
      <p className="max-w-[200px] text-xs text-muted-foreground">
        AI-assisted {label.toLowerCase()} will be available in a future release.
      </p>
    </div>
  );
}

export function AiCopilotPanel({
  className,
  variant = "sidebar",
}: AiCopilotPanelProps) {
  return (
    <aside
      className={cn(
        "flex h-full min-h-0 flex-col border-border/60 bg-card/20",
        variant === "sidebar" && "hidden w-56 shrink-0 border-l xl:flex",
        variant === "embedded" && "border-0",
        className,
      )}
    >
      <div className="border-b border-border/60 px-5 py-4">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <div>
            <h2 className="text-sm font-semibold">AI Assistant</h2>
            <p className="text-xs text-muted-foreground">
              Clinical insights and memory
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="memory" className="flex min-h-0 flex-1 flex-col">
        <TabsList className="mx-3 mt-3 grid w-auto grid-cols-2 gap-1">
          {tabs.slice(0, 4).map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="text-xs">
              <tab.icon className="h-3 w-3" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="mt-0">
              <PlaceholderContent label={tab.label} />
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </aside>
  );
}
