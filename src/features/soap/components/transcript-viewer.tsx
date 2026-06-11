"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

import { TranscriptSearch } from "@/features/soap/components/transcript-search";
import type { ConsultationTranscript } from "@/features/soap/types/transcript.types";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/shared/ui/primitives/button";

type TranscriptViewerProps = {
  transcript: ConsultationTranscript | null | undefined;
  isLoading: boolean;
  isMissing: boolean;
  onRetry?: () => void;
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function TranscriptViewer({
  transcript,
  isLoading,
  isMissing,
  onRetry,
}: TranscriptViewerProps) {
  const [query, setQuery] = useState("");
  const [activeMatchIndex, setActiveMatchIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
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
      return <p className="whitespace-pre-wrap text-sm leading-relaxed">{text}</p>;
    }

    const pattern = new RegExp(`(${escapeRegExp(query.trim())})`, "gi");
    const parts = text.split(pattern);
    let matchCursor = 0;

    return (
      <p className="whitespace-pre-wrap text-sm leading-relaxed">
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
                currentMatchIndex === activeMatchIndex && "bg-amber-400/50 ring-1 ring-amber-400",
              )}
            >
              {part}
            </mark>
          );
        })}
      </p>
    );
  };

  return (
    <div className="flex h-full min-h-0 flex-col rounded-xl border border-border/60 bg-card/30">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <div>
          <h2 className="text-sm font-medium">Transcript</h2>
          <p className="text-xs text-muted-foreground">Finalized consultation transcript</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void copyTranscript()}
          disabled={!text}
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          Copy
        </Button>
      </div>

      <TranscriptSearch
        query={query}
        matchCount={matches.length}
        activeMatchIndex={activeMatchIndex}
        onQueryChange={setQuery}
        onNextMatch={() => goToMatch(1)}
        onPreviousMatch={() => goToMatch(-1)}
      />

      <div ref={contentRef} className="min-h-0 flex-1 overflow-y-auto p-4">
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
    </div>
  );
}
