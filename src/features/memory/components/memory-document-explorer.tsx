"use client";

import { useMemo, useState } from "react";
import { FileText } from "lucide-react";

import type { MemoryDocument } from "@/features/memory/types/memory.types";
import {
  formatSourceType,
  isMeaningfulClinicalValue,
} from "@/features/memory/utils/memory.utils";
import { formatDateTime } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";

type MemoryDocumentExplorerProps = {
  documents: MemoryDocument[];
  isLoading: boolean;
};

function formatDocumentContent(content: string): string {
  const trimmed = content.trim();
  if (!trimmed.startsWith("{")) return content;

  try {
    const parsed = JSON.parse(trimmed) as Record<string, unknown>;
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return content;
    }

    const sections: string[] = [];
    const fieldLabels: Record<string, string> = {
      conditions: "Conditions",
      symptoms: "Symptoms",
      medications: "Medications",
      diagnoses: "Diagnoses",
      recommendations: "Recommendations",
      subjective: "Subjective",
      objective: "Objective",
      assessment: "Assessment",
      plan: "Plan",
      chief_complaint: "Chief complaint",
      summary: "Summary",
    };

    for (const [key, label] of Object.entries(fieldLabels)) {
      const value = parsed[key];
      if (Array.isArray(value)) {
        const items = value.map(String).filter(isMeaningfulClinicalValue);
        if (items.length > 0) {
          sections.push(`${label}:\n${items.map((item) => `• ${item}`).join("\n")}`);
        }
      } else if (typeof value === "string" && isMeaningfulClinicalValue(value)) {
        sections.push(`${label}:\n${value}`);
      }
    }

    if (sections.length > 0) return sections.join("\n\n");
  } catch {
    return content;
  }

  return content;
}

export function MemoryDocumentExplorer({
  documents,
  isLoading,
}: MemoryDocumentExplorerProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = documents.find((doc) => doc.id === selectedId) ?? documents[0];

  const displayContent = useMemo(
    () => (selected ? formatDocumentContent(selected.content) : ""),
    [selected],
  );

  return (
    <section className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border/60 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold tracking-tight">Source documents</h2>
        </div>
        {selected ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-full border border-border/60 px-2 py-0.5">
              {formatSourceType(selected.source_type)}
            </span>
            <time className="hidden sm:inline">{formatDateTime(selected.created_at)}</time>
          </div>
        ) : null}
      </div>

      {isLoading ? (
        <p className="p-4 text-sm text-muted-foreground">Loading clinical records…</p>
      ) : documents.length === 0 ? (
        <p className="p-4 text-sm text-muted-foreground">
          Consultation notes, transcripts, and summaries will appear here.
        </p>
      ) : (
        <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)] md:grid-cols-[11rem_minmax(0,1fr)] lg:grid-cols-[12rem_minmax(0,1fr)]">
          <ul className="min-h-0 overflow-y-auto border-b border-border/60 p-1.5 md:border-b-0 md:border-r">
            {documents.map((doc) => (
              <li key={doc.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(doc.id)}
                  className={cn(
                    "flex w-full items-start gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-muted/40",
                    selected?.id === doc.id && "bg-primary/10 font-medium text-primary",
                  )}
                >
                  <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-70" />
                  <span className="line-clamp-2 leading-snug">{doc.title}</span>
                </button>
              </li>
            ))}
          </ul>

          {selected ? (
            <div className="min-h-0 overflow-y-auto bg-background p-4 md:p-5">
              <pre className="w-full max-w-none whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/90">
                {displayContent}
              </pre>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
