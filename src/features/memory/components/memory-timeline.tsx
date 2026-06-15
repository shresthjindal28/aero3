import { History } from "lucide-react";

import { formatDateTime } from "@/lib/utils/date";
import { formatSourceType } from "@/features/memory/utils/memory.utils";

type TimelineItem = {
  id: string;
  title: string;
  sourceType: string;
  createdAt: string;
  consultationId: string | null;
};

type MemoryTimelineProps = {
  items: TimelineItem[];
  isLoading: boolean;
};

export function MemoryTimeline({ items, isLoading }: MemoryTimelineProps) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <History className="h-4 w-4 text-primary" />
        <h2 className="text-base font-semibold tracking-tight">Memory timeline</h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Recent notes, transcripts, and summaries added to this patient&apos;s chart.
      </p>

      {isLoading ? (
        <p className="mt-5 text-sm text-muted-foreground">Loading visit history…</p>
      ) : items.length === 0 ? (
        <p className="mt-5 rounded-xl border border-dashed border-border/60 bg-muted/10 px-4 py-5 text-sm text-muted-foreground">
          Past visits and notes will appear here as you document care.
        </p>
      ) : (
        <ol className="mt-5 space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-xl border border-border/50 bg-muted/10 px-4 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium leading-snug">{item.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatSourceType(item.sourceType as never)}
                  </p>
                </div>
                <time className="shrink-0 text-xs text-muted-foreground">
                  {formatDateTime(item.createdAt)}
                </time>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
