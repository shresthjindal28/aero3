"use client";

import {
  Bot,
  CheckCircle2,
  FileDown,
  Printer,
  RefreshCw,
  Save,
  Sparkles,
} from "lucide-react";

import { formatDateTime } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/shared/ui/primitives/button";

type PrescriptionCommandBarProps = {
  isDirty: boolean;
  isSaving: boolean;
  isApproved: boolean;
  isGenerating: boolean;
  isApproving: boolean;
  hasPrescription: boolean;
  soapMissing: boolean;
  lastSavedAt: string | null;
  documentVersion: number;
  onGenerate: () => void;
  onRegenerate: () => void;
  onSave: () => void;
  onApprove: () => void;
  onPrint: () => void;
  onExportPdf: () => void;
  onOpenAiAssistant: () => void;
};

export function PrescriptionCommandBar({
  isDirty,
  isSaving,
  isApproved,
  isGenerating,
  isApproving,
  hasPrescription,
  soapMissing,
  lastSavedAt,
  documentVersion,
  onGenerate,
  onRegenerate,
  onSave,
  onApprove,
  onPrint,
  onExportPdf,
  onOpenAiAssistant,
}: PrescriptionCommandBarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-background/95 backdrop-blur">
      <div className="flex flex-col gap-2 px-4 py-3 lg:px-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
              Prescription
            </h1>
            <p className="text-xs text-muted-foreground">
              Version {documentVersion}
              {lastSavedAt ? ` · Last saved ${formatDateTime(lastSavedAt)}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            {isSaving ? (
              <span className="text-muted-foreground">Saving…</span>
            ) : isDirty ? (
              <span className="font-medium text-amber-500">Unsaved changes</span>
            ) : (
              <span className="text-muted-foreground">All changes saved</span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!hasPrescription ? (
            <Button
              type="button"
              size="sm"
              onClick={onGenerate}
              disabled={isGenerating || soapMissing}
            >
              <Sparkles className="h-4 w-4" />
              {isGenerating ? "Generating…" : "Generate Prescription"}
            </Button>
          ) : (
            <>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={onRegenerate}
                disabled={isGenerating || isApproved || soapMissing}
              >
                <RefreshCw className={cn("h-4 w-4", isGenerating && "animate-spin")} />
                Regenerate
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={onSave}
                disabled={!isDirty || isSaving || isApproved}
              >
                <Save className="h-4 w-4" />
                Save
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={onPrint}
                disabled={!hasPrescription}
              >
                <Printer className="h-4 w-4" />
                Print
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={onExportPdf}
                disabled={!hasPrescription}
              >
                <FileDown className="h-4 w-4" />
                Export PDF
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={onApprove}
                disabled={!hasPrescription || isApproving || isApproved}
              >
                <CheckCircle2 className="h-4 w-4" />
                {isApproving ? "Approving…" : isApproved ? "Approved" : "Approve"}
              </Button>
            </>
          )}

          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="ml-auto"
            onClick={onOpenAiAssistant}
          >
            <Bot className="h-4 w-4" />
            AI Assistant
          </Button>
        </div>
      </div>
    </header>
  );
}
