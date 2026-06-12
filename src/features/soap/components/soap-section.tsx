"use client";

import type { SoapSectionKey } from "@/features/soap/types/soap.types";
import { countWords } from "@/features/soap/utils/soap.utils";
import { useAutoResizeTextarea } from "@/shared/hooks/use-auto-resize-textarea";
import { cn } from "@/lib/utils/cn";

type SoapSectionProps = {
  sectionKey: SoapSectionKey;
  label: string;
  description: string;
  value: string;
  readOnly?: boolean;
  onChange: (value: string) => void;
};

export function SoapSection({
  sectionKey,
  label,
  description,
  value,
  readOnly = false,
  onChange,
}: SoapSectionProps) {
  const wordCount = countWords(value);
  const { ref, resize } = useAutoResizeTextarea(value, 160);

  return (
    <section className="group" aria-labelledby={`soap-heading-${sectionKey}`}>
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <div>
          <h3
            id={`soap-heading-${sectionKey}`}
            className="text-xl font-semibold tracking-tight text-foreground"
          >
            {label}
          </h3>
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        </div>
        <span className="shrink-0 font-mono text-xs text-muted-foreground opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
          {wordCount} {wordCount === 1 ? "word" : "words"}
        </span>
      </div>

      <div className="mb-2 h-px bg-border/80" />

      <textarea
        ref={ref}
        id={`soap-section-${sectionKey}`}
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          resize();
        }}
        readOnly={readOnly}
        placeholder={`Enter ${label.toLowerCase()} notes…`}
        rows={6}
        className={cn(
          "w-full resize-none border-0 bg-transparent p-0 text-[17px] leading-[1.75] text-foreground",
          "placeholder:text-muted-foreground/50",
          "focus:outline-none focus:ring-0",
          readOnly && "cursor-default opacity-80",
        )}
      />
    </section>
  );
}
