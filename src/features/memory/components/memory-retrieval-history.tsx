import { SearchCheck } from "lucide-react";

import type { MemoryRetrievalRecord } from "@/features/memory/types/memory.types";
import { formatDateTime } from "@/lib/utils/date";
import { formatScore } from "@/features/memory/utils/memory.utils";

type MemoryRetrievalHistoryProps = {
  records: MemoryRetrievalRecord[];
};

export function MemoryRetrievalHistory({ records }: MemoryRetrievalHistoryProps) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <SearchCheck className="h-4 w-4 text-primary" />
        <h2 className="text-base font-semibold tracking-tight">Recent searches</h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Questions you&apos;ve asked about this patient&apos;s chart.
      </p>

      {records.length === 0 ? (
        <p className="mt-5 rounded-xl border border-dashed border-border/60 bg-muted/10 px-4 py-5 text-sm text-muted-foreground">
          Your recent memory searches will appear here.
        </p>
      ) : (
        <ul className="mt-5 space-y-3">
          {records.map((record) => (
            <li
              key={record.id}
              className="rounded-xl border border-border/50 bg-muted/10 px-4 py-3"
            >
              <p className="text-sm font-medium leading-snug">&ldquo;{record.query}&rdquo;</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {record.resultCount} result{record.resultCount === 1 ? "" : "s"}
                {record.topScore != null ? ` · top match ${formatScore(record.topScore)}` : ""}
                {" · "}
                {formatDateTime(record.searchedAt)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
