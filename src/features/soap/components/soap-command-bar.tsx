"use client";

import {
  Bot,
  CheckCircle2,
  FileDown,
  Pill,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { ApprovalBadge } from "@/features/soap/components/approval-badge";
import type { Consultation } from "@/features/consultations/types/consultation.types";
import type { SoapNote } from "@/features/soap/types/soap.types";
import { formatDateTime } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import { routes } from "@/shared/constants/routes";
import { Button } from "@/shared/ui/primitives/button";

type SoapCommandBarProps = {
  consultation: Consultation;
  patientName: string;
  soap: SoapNote | null | undefined;
  isDirty: boolean;
  isSaving: boolean;
  isApproved: boolean;
  isGenerating: boolean;
  isApproving: boolean;
  canGenerate: boolean;
  hasSoap: boolean;
  transcriptMissing: boolean;
  lastSavedAt: string | null;
  onGenerate: () => void;
  onRegenerate: () => void;
  onApprove: () => void;
  onExportPdf: () => void;
  onOpenAiAssistant: () => void;
};

export function SoapCommandBar({
  consultation,
  patientName,
  soap,
  isDirty,
  isSaving,
  isApproved,
  isGenerating,
  isApproving,
  canGenerate,
  hasSoap,
  transcriptMissing,
  lastSavedAt,
  onGenerate,
  onRegenerate,
  onApprove,
  onExportPdf,
  onOpenAiAssistant,
}: SoapCommandBarProps) {
  const consultationLabel = consultation.chief_complaint ?? "Consultation";

  const router = useRouter();

  const handleGeneratePrescription = () => {
    router.push(
      routes.app.consultationPrescription(consultation.id, { generate: true }),
    );
  };

  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex flex-col gap-3 px-4 py-3 lg:px-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="truncate text-sm text-muted-foreground">{patientName}</p>
            <h1 className="truncate text-lg font-semibold tracking-tight sm:text-xl">
              {consultationLabel}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ApprovalBadge soap={soap} />
            <SaveStatus
              isDirty={isDirty}
              isSaving={isSaving}
              lastSavedAt={lastSavedAt}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!hasSoap ? (
            <Button
              type="button"
              size="sm"
              onClick={onGenerate}
              disabled={isGenerating || transcriptMissing}
            >
              <Sparkles className="h-4 w-4" />
              {isGenerating ? "Generating…" : "Generate SOAP"}
            </Button>
          ) : (
            <>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={onRegenerate}
                disabled={isGenerating || isApproved || transcriptMissing}
              >
                <RefreshCw className={cn("h-4 w-4", isGenerating && "animate-spin")} />
                Regenerate
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleGeneratePrescription}
                disabled={!hasSoap || !isApproved}
              >
                <Pill className="h-4 w-4" />
                {isApproved ? "Generate Prescription" : "Approve SOAP first"}
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={onExportPdf}>
                <FileDown className="h-4 w-4" />
                Export PDF
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={onApprove}
                disabled={!canGenerate || isApproving || isApproved}
              >
                <CheckCircle2 className="h-4 w-4" />
                {isApproving ? "Approving…" : isApproved ? "Approved" : "Approve SOAP"}
              </Button>
            </>
          )}

          <div className="ml-auto flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={onOpenAiAssistant}
            >
              <Bot className="h-4 w-4" />
              <span className="hidden sm:inline">AI Assistant</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

function SaveStatus({
  isDirty,
  isSaving,
  lastSavedAt,
}: {
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt: string | null;
}) {
  if (isSaving) {
    return (
      <span className="rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground">
        Saving…
      </span>
    );
  }

  if (isDirty) {
    return (
      <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-500">
        Unsaved changes
      </span>
    );
  }

  return (
    <span className="text-xs text-muted-foreground">
      {lastSavedAt ? `Saved ${formatDateTime(lastSavedAt)}` : "All changes saved"}
    </span>
  );
}
