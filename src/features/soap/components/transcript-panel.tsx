"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Copy, Maximize2, Minimize2 } from "lucide-react";
import { toast } from "sonner";

import { TranscriptSearch } from "@/features/soap/components/transcript-search";
import type { ConsultationTranscript } from "@/features/soap/types/transcript.types";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/shared/ui/primitives/button";

type TranscriptPanelProps = {
  transcript: ConsultationTranscript | null | undefined;
  isLoading: boolean;
  isMissing: boolean;
  collapsed: boolean;
  expanded: boolean;
  onToggleCollapsed: () => void;
  onToggleExpanded: () => void;
  onRetry?: () => void;
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function TranscriptPanel({
  transcript,
  isLoading,
  isMissing,
  collapsed,
  expanded,
  onToggleCollapsed,
  onToggleExpanded,
  onRetry,
}: TranscriptPanelProps) {
  const [query, setQuery] = useState("");
  const [activeMatchIndex, setActiveMatchIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const matchRefs = useRef<Array<HTMLSpanElement | null>>([]);

  const text = transcript?.transcript_text ?? "";

  const matches = useMemo(() => {
    if (!query.trim() || !text) return [] as number[];
    const pattern = new RegExp(escapeRegExp(query.trim()), "gi");
    const indices: number[] = [];
    let match = pattern.exec(text);
    while (match) {
      indices.push(match.index);
      match = pattern.exec(text);
    }
    return indices;
  }, [query, text]);

  useEffect(() => {
    setActiveMatchIndex(0);
  }, [query, matches.length]);

  useEffect(() => {
    const target = matchRefs.current[activeMatchIndex];
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeMatchIndex, matches.length]);

  const goToMatch = (direction: 1 | -1) => {
    if (matches.length === 0) return;
    setActiveMatchIndex((current) => {
      const next = (current + direction + matches.length) % matches.length;
      return next;
    });
  };

  const copyTranscript = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Transcript copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy transcript");
    }
  };

  const renderHighlightedText = () => {
    if (!text) return null;
    if (!query.trim()) {
      return (
        <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-foreground/90">
          {text}
        </p>
      );
    }

    const pattern = new RegExp(`(${escapeRegExp(query.trim())})`, "gi");
    const parts = text.split(pattern);
    let matchCursor = 0;

    return (
      <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-foreground/90">
        {parts.map((part, index) => {
          const isMatch = part.toLowerCase() === query.trim().toLowerCase();
          if (!isMatch) {
            return <span key={`${part}-${index}`}>{part}</span>;
          }

          const currentMatchIndex = matchCursor;
          matchCursor += 1;

          return (
            <mark
              key={`match-${index}-${part}`}
              ref={(element) => {
                matchRefs.current[currentMatchIndex] = element;
              }}
              className={cn(
                "rounded-sm bg-amber-500/30 px-0.5 text-foreground",
                currentMatchIndex === activeMatchIndex &&
                  "bg-amber-400/50 ring-1 ring-amber-400",
              )}
            >
              {part}
            </mark>
          );
        })}
      </p>
    );
  };

  if (collapsed) {
    return (
      <aside className="flex h-full w-10 shrink-0 flex-col items-center border-l border-border/60 bg-card/20 py-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onToggleCollapsed}
          aria-label="Show transcript"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span
          className="mt-4 text-[10px] font-medium uppercase tracking-widest text-muted-foreground [writing-mode:vertical-lr]"
          style={{ textOrientation: "mixed" }}
        >
          Transcript
        </span>
      </aside>
    );
  }

  return (
    <aside className="flex h-full min-h-0 shrink-0 flex-col border-l border-border/60 bg-card/20">
      <div className="flex items-center justify-between gap-2 border-b border-border/60 px-3 py-2.5">
        <div className="min-w-0">
          <h2 className="text-sm font-medium">Transcript</h2>
          <p className="truncate text-[11px] text-muted-foreground">
            Consultation recording
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onToggleExpanded}
            aria-label={expanded ? "Collapse transcript width" : "Expand transcript width"}
          >
            {expanded ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => void copyTranscript()}
            disabled={!text}
            aria-label="Copy transcript"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onToggleCollapsed}
            aria-label="Hide transcript"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <TranscriptSearch
        query={query}
        matchCount={matches.length}
        activeMatchIndex={activeMatchIndex}
        onQueryChange={setQuery}
        onNextMatch={() => goToMatch(1)}
        onPreviousMatch={() => goToMatch(-1)}
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading transcript…</p>
        ) : isMissing ? (
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>Transcript not available yet.</p>
            {onRetry ? (
              <Button type="button" variant="outline" size="sm" onClick={onRetry}>
                Retry
              </Button>
            ) : null}
          </div>
        ) : (
          renderHighlightedText()
        )}
      </div>
    </aside>
  );
}
