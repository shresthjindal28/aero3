"use client";

import { SoapSection } from "@/features/soap/components/soap-section";
import type { SoapDraft, SoapSectionKey } from "@/features/soap/types/soap.types";
import {
  countTotalCharacters,
  countTotalWords,
  SOAP_SECTIONS,
} from "@/features/soap/utils/soap.utils";
import { formatDateTime } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";

type SoapEditorProps = {
  draft: SoapDraft;
  readOnly?: boolean;
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt: string | null;
  onSectionChange: (key: SoapSectionKey, value: string) => void;
};

export function SoapEditor({
  draft,
  readOnly = false,
  isDirty,
  isSaving,
  lastSavedAt,
  onSectionChange,
}: SoapEditorProps) {
  const totalWords = countTotalWords(draft);
  const totalCharacters = countTotalCharacters(draft);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="sticky top-0 z-10 border-b border-border/40 bg-background/90 px-6 py-3 backdrop-blur sm:px-10">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">SOAP note</span>
          <span aria-hidden="true">·</span>
          <span>{totalWords.toLocaleString()} words</span>
          <span aria-hidden="true">·</span>
          <span>{totalCharacters.toLocaleString()} characters</span>
          <span aria-hidden="true">·</span>
          <SaveIndicator isDirty={isDirty} isSaving={isSaving} lastSavedAt={lastSavedAt} />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <article className="mx-auto max-w-3xl px-6 py-10 sm:px-10 sm:py-12">
          <div className="space-y-14">
            {SOAP_SECTIONS.map((section) => (
              <SoapSection
                key={section.key}
                sectionKey={section.key}
                label={section.label}
                description={section.description}
                value={draft[section.key]}
                readOnly={readOnly}
                onChange={(value) => onSectionChange(section.key, value)}
              />
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}

function SaveIndicator({
  isDirty,
  isSaving,
  lastSavedAt,
}: {
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt: string | null;
}) {
  if (isSaving) {
    return <span>Saving…</span>;
  }

  if (isDirty) {
    return (
      <span className={cn("font-medium text-amber-500")}>Unsaved changes</span>
    );
  }

  if (lastSavedAt) {
    return <span>Last saved {formatDateTime(lastSavedAt)}</span>;
  }

  return <span>All changes saved</span>;
}
