"use client";

import { ChevronDown, ChevronUp, Search } from "lucide-react";

import { Input } from "@/shared/ui/primitives/input";
import { Button } from "@/shared/ui/primitives/button";

type TranscriptSearchProps = {
  query: string;
  matchCount: number;
  activeMatchIndex: number;
  onQueryChange: (query: string) => void;
  onNextMatch: () => void;
  onPreviousMatch: () => void;
};

export function TranscriptSearch({
  query,
  matchCount,
  activeMatchIndex,
  onQueryChange,
  onNextMatch,
  onPreviousMatch,
}: TranscriptSearchProps) {
  return (
    <div className="flex items-center gap-2 border-b border-border/60 px-3 py-2">
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search transcript…"
          className="h-8 border-border/60 bg-background/60 pl-8 text-xs"
        />
      </div>
      {query ? (
        <div className="flex items-center gap-1">
          <span className="whitespace-nowrap font-mono text-xs text-muted-foreground">
            {matchCount > 0 ? `${activeMatchIndex + 1}/${matchCount}` : "0/0"}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onPreviousMatch}
            disabled={matchCount === 0}
            aria-label="Previous match"
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onNextMatch}
            disabled={matchCount === 0}
            aria-label="Next match"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : null}
    </div>
  );
}
