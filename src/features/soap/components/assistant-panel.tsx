import { Brain, FileSearch, Lightbulb, Pill, Sparkles } from "lucide-react";

const upcomingFeatures = [
  { icon: Brain, label: "Memory" },
  { icon: FileSearch, label: "RAG" },
  { icon: Lightbulb, label: "Clinical insights" },
  { icon: Pill, label: "Medication suggestions" },
];

export function AssistantPanel() {
  return (
    <aside className="hidden w-56 shrink-0 flex-col border-l border-border/60 bg-card/20 xl:flex">
      <div className="border-b border-border/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-medium">AI assistant</h2>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="rounded-full border border-dashed border-border/60 p-4">
          <Sparkles className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">Coming soon</p>
          <p className="text-xs text-muted-foreground">
            Clinical AI tools will appear here to assist your documentation workflow.
          </p>
        </div>

        <ul className="w-full space-y-2 text-left text-xs text-muted-foreground">
          {upcomingFeatures.map((feature) => (
            <li
              key={feature.label}
              className="flex items-center gap-2 rounded-lg border border-border/40 bg-muted/10 px-3 py-2"
            >
              <feature.icon className="h-3.5 w-3.5" />
              {feature.label}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
