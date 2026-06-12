import type { MemoryRetrievalRecord } from "@/features/memory/types/memory.types";
import { formatDateTime } from "@/lib/utils/date";

type MemoryRetrievalHistoryProps = {
  records: MemoryRetrievalRecord[];
};

export function MemoryRetrievalHistory({ records }: MemoryRetrievalHistoryProps) {
  return (
    <section className="rounded-xl border border-border/60 bg-card/50 p-5">
      <h2 className="text-sm font-medium">Retrieval history</h2>

      {records.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Your recent memory searches will appear here.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {records.map((record) => (
            <li
              key={record.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border/40 px-3 py-2 text-sm"
            >
              <span className="truncate">{record.query}</span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {record.resultCount} results
                {record.topScore !== null
                  ? ` · ${Math.round(record.topScore * 100)}%`
                  : ""}{" "}
                · {formatDateTime(record.searchedAt)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
