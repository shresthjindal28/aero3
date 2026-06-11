"use client";

import { SoapSection } from "@/features/soap/components/soap-section";
import type { SoapDraft, SoapSectionKey } from "@/features/soap/types/soap.types";
import { countTotalWords, SOAP_SECTIONS } from "@/features/soap/utils/soap.utils";

type SoapEditorProps = {
  draft: SoapDraft;
  collapsedSections: Record<SoapSectionKey, boolean>;
  readOnly?: boolean;
  onSectionChange: (key: SoapSectionKey, value: string) => void;
  onToggleSection: (key: SoapSectionKey) => void;
};

export function SoapEditor({
  draft,
  collapsedSections,
  readOnly = false,
  onSectionChange,
  onToggleSection,
}: SoapEditorProps) {
  const totalWords = countTotalWords(draft);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <div>
          <h2 className="text-sm font-medium">SOAP note</h2>
          <p className="text-xs text-muted-foreground">
            AI-assisted clinical documentation
          </p>
        </div>
        <span className="font-mono text-xs text-muted-foreground">
          {totalWords} words total
        </span>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {SOAP_SECTIONS.map((section) => (
          <SoapSection
            key={section.key}
            sectionKey={section.key}
            label={section.label}
            description={section.description}
            value={draft[section.key]}
            collapsed={collapsedSections[section.key]}
            readOnly={readOnly}
            onToggle={() => onToggleSection(section.key)}
            onChange={(value) => onSectionChange(section.key, value)}
          />
        ))}
      </div>
    </div>
  );
}
