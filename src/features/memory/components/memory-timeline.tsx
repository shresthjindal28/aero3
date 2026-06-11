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
    <section className="rounded-xl border border-border/60 bg-card/50 p-5">
      <h2 className="text-sm font-medium">Memory timeline</h2>

      {isLoading ? (
        <p className="mt-4 text-sm text-muted-foreground">Loading timeline…</p>
      ) : items.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No memory updates yet.</p>
      ) : (
        <ol className="mt-4 space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-lg border border-border/40 bg-muted/10 px-3 py-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
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
