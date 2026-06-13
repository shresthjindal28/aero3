"use client";

import Link from "next/link";
import {
  ArrowLeft,
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
import { routes } from "@/shared/constants/routes";
import { Button } from "@/shared/ui/primitives/button";

type PrescriptionCommandBarProps = {
  consultationId: string;
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
  consultationId,
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
    <header className="sticky top-0 z-20 shrink-0 border-b border-border/60 bg-background shadow-sm">
      <div className="flex flex-col gap-2 px-4 py-2.5 lg:flex-row lg:items-center lg:justify-between lg:gap-4 lg:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0"
            asChild
          >
            <Link href={routes.app.consultationDetail(consultationId)} aria-label="Back">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Pill className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs text-muted-foreground">{patientName}</p>
            <h1 className="truncate text-base font-semibold tracking-tight lg:text-lg">
              {consultationLabel}
            </h1>
            <p className="hidden truncate text-[11px] text-muted-foreground sm:block">
              Prescription · v{documentVersion}
              {lastSavedAt ? ` · Saved ${formatDateTime(lastSavedAt)}` : ""}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          {isApproved && isRevising ? (
            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-600 dark:text-amber-400">
              Revision in progress
            </span>
          ) : isApproved ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3 w-3" />
              Approved
            </span>
          ) : isSaving ? (
            <span className="rounded-full border border-border/60 bg-muted/50 px-2.5 py-0.5 text-[11px] text-muted-foreground">
              Saving…
            </span>
          ) : isDirty ? (
            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-600 dark:text-amber-400">
              Unsaved
            </span>
          ) : (
            <span className="hidden rounded-full border border-border/60 bg-muted/40 px-2.5 py-0.5 text-[11px] text-muted-foreground xl:inline">
              Saved
            </span>
          )}

          {!hasPrescription ? (
            <>
              <Button
                type="button"
                size="sm"
                onClick={onGenerate}
                disabled={isGenerating || soapMissing}
              >
                <Sparkles className="h-4 w-4" />
                {isGenerating ? "Generating…" : "Generate"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={onOpenAiAssistant}
              >
                <Bot className="h-4 w-4" />
                <span className="hidden sm:inline">AI Assistant</span>
              </Button>
            </>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-1 rounded-lg border border-border/50 bg-muted/20 p-0.5">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-8 px-2.5"
                  onClick={onRegenerate}
                  disabled={isGenerating || soapMissing}
                >
                  <RefreshCw
                    className={cn("h-4 w-4", isGenerating && "animate-spin")}
                  />
                  <span className="hidden xl:inline">Regenerate</span>
                </Button>
                {isApproved && !isRevising ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2.5"
                    onClick={onStartRevision}
                  >
                    <Save className="h-4 w-4" />
                    <span className="hidden xl:inline">Revise</span>
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2.5"
                    onClick={onSave}
                    disabled={!isDirty || isSaving}
                  >
                    <Save className="h-4 w-4" />
                    <span className="hidden xl:inline">Save</span>
                  </Button>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-8 px-2.5"
                  onClick={onPrint}
                >
                  <Printer className="h-4 w-4" />
                  <span className="hidden xl:inline">Print</span>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-8 px-2.5"
                  onClick={onExportPdf}
                >
                  <FileDown className="h-4 w-4" />
                  <span className="hidden xl:inline">PDF</span>
                </Button>
              </div>

              <Button
                type="button"
                size="sm"
                onClick={onApprove}
                disabled={isApproving || isApproved}
              >
                <CheckCircle2 className="h-4 w-4" />
                {isApproving ? "Approving…" : isApproved ? "Approved" : "Approve"}
              </Button>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={onOpenAiAssistant}
              >
                <Bot className="h-4 w-4" />
                <span className="hidden sm:inline">AI</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
