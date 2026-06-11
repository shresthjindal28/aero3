"use client";

import { ChevronDown, ChevronRight } from "lucide-react";

import type { SoapSectionKey } from "@/features/soap/types/soap.types";
import { countWords } from "@/features/soap/utils/soap.utils";
import { cn } from "@/lib/utils/cn";
import { Textarea } from "@/shared/ui/primitives/textarea";

type SoapSectionProps = {
  sectionKey: SoapSectionKey;
  label: string;
  description: string;
  value: string;
  collapsed: boolean;
  readOnly?: boolean;
  onToggle: () => void;
  onChange: (value: string) => void;
};

export function SoapSection({
  sectionKey,
  label,
  description,
  value,
  collapsed,
  readOnly = false,
  onToggle,
  onChange,
}: SoapSectionProps) {
  const wordCount = countWords(value);

  return (
    <section className="rounded-xl border border-border/60 bg-card/40">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        aria-expanded={!collapsed}
        aria-controls={`soap-section-${sectionKey}`}
      >
        <div className="flex items-center gap-2">
          {collapsed ? (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
          <div>
            <h3 className="text-sm font-semibold">{label}</h3>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        <span className="shrink-0 font-mono text-xs text-muted-foreground">
          {wordCount} {wordCount === 1 ? "word" : "words"}
        </span>
      </button>

      <div
        id={`soap-section-${sectionKey}`}
        className={cn("px-4 pb-4", collapsed && "hidden")}
      >
        <Textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          readOnly={readOnly}
          placeholder={`Enter ${label.toLowerCase()} notes…`}
          className={cn(
            "min-h-[140px] resize-y border-border/60 bg-background/60 font-[inherit] leading-relaxed",
            readOnly && "cursor-default opacity-80",
          )}
        />
      </div>
    </section>
  );
}
