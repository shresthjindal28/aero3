"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  FileDown,
  FileText,
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

function splitChiefComplaint(raw: string | null): {
  headline: string;
  summary: string | null;
} {
  if (!raw?.trim()) {
    return { headline: "SOAP note", summary: null };
  }

  const notesMatch = raw.match(/^(.+?)\s+notes:\s*(.+)$/i);
  if (notesMatch) {
    return {
      headline: notesMatch[1].trim(),
      summary: notesMatch[2].trim(),
    };
  }

  const firstSentence = raw.match(/^(.+?[.!?])(?:\s+|$)/);
  if (firstSentence && firstSentence[1].length < raw.length) {
    return {
      headline: firstSentence[1].trim(),
      summary: raw.slice(firstSentence[1].length).trim() || null,
    };
  }

  if (raw.length > 72) {
    return {
      headline: `${raw.slice(0, 72).trim()}…`,
      summary: raw,
    };
  }

  return { headline: raw.trim(), summary: null };
}

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
  const router = useRouter();
  const { headline, summary } = splitChiefComplaint(consultation.chief_complaint);
  const approvedAt = soap?.approved_at ? formatDateTime(soap.approved_at) : null;

  const handleGeneratePrescription = () => {
    router.push(
      routes.app.consultationPrescription(consultation.id, { generate: true }),
    );
  };

  return (
    <header className="sticky top-0 z-20 shrink-0 border-b border-border/60 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="flex flex-col gap-2 px-4 py-2.5 lg:flex-row lg:items-center lg:justify-between lg:gap-4 lg:px-6">
        <div className="flex min-w-0 items-start gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="mt-0.5 h-9 w-9 shrink-0"
            asChild
          >
            <Link
              href={routes.app.consultationDetail(consultation.id)}
              aria-label="Back to consultation"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>

          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="h-4 w-4" />
            </div>

            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <h1 className="truncate text-base font-semibold tracking-tight lg:text-lg">
                  {patientName}
                </h1>
                <ApprovalBadge soap={soap} />
              </div>

              <p className="line-clamp-1 text-sm text-foreground/80">{headline}</p>

              {summary ? (
                <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {summary}
                </p>
              ) : null}

              <p className="text-[11px] text-muted-foreground">
                {isSaving
                  ? "Saving changes…"
                  : isDirty
                    ? "Unsaved changes"
                    : lastSavedAt
                      ? `Last saved ${formatDateTime(lastSavedAt)}`
                      : "All changes saved"}
                {approvedAt ? ` · Approved ${approvedAt}` : ""}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          {!hasSoap ? (
            <>
              <Button
                type="button"
                size="sm"
                onClick={onGenerate}
                disabled={isGenerating || transcriptMissing}
              >
                <Sparkles className="h-4 w-4" />
                {isGenerating ? "Generating…" : "Generate SOAP"}
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={onOpenAiAssistant}>
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
                  disabled={isGenerating || isApproved || transcriptMissing}
                >
                  <RefreshCw
                    className={cn("h-4 w-4", isGenerating && "animate-spin")}
                  />
                  <span className="hidden xl:inline">Regenerate</span>
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-8 px-2.5"
                  onClick={handleGeneratePrescription}
                  disabled={!isApproved}
                  title={isApproved ? undefined : "Approve the SOAP note first"}
                >
                  <Pill className="h-4 w-4" />
                  <span className="hidden xl:inline">Prescription</span>
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-8 px-2.5"
                  onClick={onExportPdf}
                >
                  <FileDown className="h-4 w-4" />
                  <span className="hidden xl:inline">Export PDF</span>
                </Button>
              </div>

              {!isApproved ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={onApprove}
                  disabled={!canGenerate || isApproving}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {isApproving ? "Approving…" : "Approve SOAP"}
                </Button>
              ) : null}

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
          )}
        </div>
      </div>
    </header>
  );
}
