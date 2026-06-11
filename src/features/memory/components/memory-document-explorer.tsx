"use client";

import { useState } from "react";
import { FileText } from "lucide-react";

import type { MemoryDocument } from "@/features/memory/types/memory.types";
import { formatSourceType } from "@/features/memory/utils/memory.utils";
import { formatDateTime } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";

type MemoryDocumentExplorerProps = {
  documents: MemoryDocument[];
  isLoading: boolean;
};

export function MemoryDocumentExplorer({
  documents,
  isLoading,
}: MemoryDocumentExplorerProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = documents.find((doc) => doc.id === selectedId) ?? documents[0];

  return (
    <section className="flex h-full min-h-[320px] flex-col rounded-xl border border-border/60 bg-card/50">
      <div className="border-b border-border/60 px-4 py-3">
        <h2 className="text-sm font-medium">Memory documents</h2>
      </div>

      {isLoading ? (
        <p className="p-4 text-sm text-muted-foreground">Loading documents…</p>
      ) : documents.length === 0 ? (
        <p className="p-4 text-sm text-muted-foreground">No memory documents yet.</p>
      ) : (
        <div className="grid min-h-0 flex-1 md:grid-cols-[220px_1fr]">
          <ul className="overflow-y-auto border-b border-border/60 p-2 md:border-b-0 md:border-r">
            {documents.map((doc) => (
              <li key={doc.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(doc.id)}
                  className={cn(
                    "flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors hover:bg-muted/40",
                    selected?.id === doc.id && "bg-primary/10",
                  )}
                >
                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="line-clamp-2">{doc.title}</span>
                </button>
              </li>
            ))}
          </ul>

          {selected ? (
            <div className="min-h-0 overflow-y-auto p-4">
              <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>{formatSourceType(selected.source_type)}</span>
                <span>·</span>
                <time>{formatDateTime(selected.created_at)}</time>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {selected.content}
              </p>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
