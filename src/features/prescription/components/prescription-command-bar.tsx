"use client";

import {
  Bot,
  CheckCircle2,
  FileDown,
  Pill,
  Printer,
  RefreshCw,
  Save,
  Sparkles,
} from "lucide-react";

import { formatDateTime } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/shared/ui/primitives/button";

type PrescriptionCommandBarProps = {
  patientName: string;
  consultationLabel: string;
  isDirty: boolean;
  isSaving: boolean;
  isApproved: boolean;
  isRevising: boolean;
  isGenerating: boolean;
  isApproving: boolean;
  hasPrescription: boolean;
  soapMissing: boolean;
  lastSavedAt: string | null;
  documentVersion: number;
  onGenerate: () => void;
  onRegenerate: () => void;
  onSave: () => void;
  onStartRevision: () => void;
  onApprove: () => void;
  onPrint: () => void;
  onExportPdf: () => void;
  onOpenAiAssistant: () => void;
};

export function PrescriptionCommandBar({
  patientName,
  consultationLabel,
  isDirty,
  isSaving,
  isApproved,
  isRevising,
  isGenerating,
  isApproving,
  hasPrescription,
  soapMissing,
  lastSavedAt,
  documentVersion,
  onGenerate,
  onRegenerate,
  onSave,
  onStartRevision,
  onApprove,
  onPrint,
  onExportPdf,
  onOpenAiAssistant,
}: PrescriptionCommandBarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/90">
      <div className="flex flex-col gap-3 px-4 py-3 lg:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Pill className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm text-muted-foreground">{patientName}</p>
              <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">
                {consultationLabel}
              </h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Prescription · v{documentVersion}
                {lastSavedAt ? ` · Saved ${formatDateTime(lastSavedAt)}` : ""}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isApproved && isRevising ? (
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                Revision in progress
              </span>
            ) : isApproved ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Approved · permanent record
              </span>
            ) : isSaving ? (
              <span className="rounded-full border border-border/60 bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
                Saving…
              </span>
            ) : isDirty ? (
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                Unsaved changes
              </span>
            ) : (
              <span className="rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
                All changes saved
              </span>
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
              <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border/50 bg-muted/20 p-1">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-8"
                  onClick={onRegenerate}
                  disabled={isGenerating || soapMissing}
                >
                  <RefreshCw
                    className={cn("h-4 w-4", isGenerating && "animate-spin")}
                  />
                  Regenerate
                </Button>
                {isApproved && !isRevising ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-8"
                    onClick={onStartRevision}
                  >
                    <Save className="h-4 w-4" />
                    Revise
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-8"
                    onClick={onSave}
                    disabled={!isDirty || isSaving}
                  >
                    <Save className="h-4 w-4" />
                    Save
                  </Button>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-8"
                  onClick={onPrint}
                >
                  <Printer className="h-4 w-4" />
                  Print
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-8"
                  onClick={onExportPdf}
                >
                  <FileDown className="h-4 w-4" />
                  Export PDF
                </Button>
              </div>

              <Button
                type="button"
                size="sm"
                onClick={onApprove}
                disabled={isApproving || isApproved}
                className="ml-auto sm:ml-0"
              >
                <CheckCircle2 className="h-4 w-4" />
                {isApproving ? "Approving…" : isApproved ? "Approved" : "Approve Prescription"}
              </Button>
            </>
          )}

          <Button
            type="button"
            size="sm"
            variant="outline"
            className={cn(!hasPrescription && "ml-auto")}
            onClick={onOpenAiAssistant}
          >
            <Bot className="h-4 w-4" />
            <span className="hidden sm:inline">AI Assistant</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
