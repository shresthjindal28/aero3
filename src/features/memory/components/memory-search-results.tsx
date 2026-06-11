import type { MemorySearchResult } from "@/features/memory/types/memory.types";
import { formatScore, formatSourceType } from "@/features/memory/utils/memory.utils";

type MemorySearchResultsProps = {
  results: MemorySearchResult[];
  query: string;
  isSearching: boolean;
};

export function MemorySearchResults({
  results,
  query,
  isSearching,
}: MemorySearchResultsProps) {
  if (isSearching) {
    return <p className="text-sm text-muted-foreground">Searching memory…</p>;
  }

  if (!query.trim()) {
    return (
      <p className="text-sm text-muted-foreground">
        Enter a query to search vector memory.
      </p>
    );
  }

  if (results.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No similar memories found.</p>
    );
  }

  return (
    <div className="space-y-3">
      {results.map((result) => (
        <article
          key={`${result.document_id}-${result.chunk_id}`}
          className="rounded-lg border border-border/60 bg-muted/10 p-3"
        >
          <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground/80">{result.title}</span>
            <span>·</span>
            <span>{formatSourceType(result.source_type)}</span>
            <span>·</span>
            <span className="font-mono text-primary">{formatScore(result.score)}</span>
          </div>
          <p className="text-sm leading-relaxed">{result.chunk_text}</p>
        </article>
      ))}
    </div>
  );
}
