"use client";

import { FileText, Loader2, Sparkles } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { useDoctorMe } from "@/features/auth/hooks/use-doctor-auth";
import { PrescriptionCommandBar } from "@/features/prescription/components/prescription-command-bar";
import { PrescriptionHtmlEditor } from "@/features/prescription/components/prescription-html-editor";
import { PrescriptionSummarySidebar } from "@/features/prescription/components/prescription-summary-sidebar";
import { usePrescriptionWorkspace } from "@/features/prescription/hooks/use-prescription-workspace";
import { AiAssistantDrawer } from "@/features/soap/components/ai-assistant-drawer";
import { routes } from "@/shared/constants/routes";
import { ExportService } from "@/shared/export/export.service";
import { ApiErrorDisplay } from "@/shared/ui/feedback/api-error";
import { ShellSkeletonLoader } from "@/shared/ui/feedback/skeleton-loader";
import { Button } from "@/shared/ui/primitives/button";

type PrescriptionWorkspaceProps = {
  consultationId: string;
};

export function PrescriptionWorkspace({ consultationId }: PrescriptionWorkspaceProps) {
  const workspace = usePrescriptionWorkspace(consultationId);
  const { data: doctor } = useDoctorMe(Boolean(workspace.consultation));
  const [aiOpen, setAiOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const autoGenerateTriggeredRef = useRef(false);

  const shouldAutoGenerate = searchParams.get("generate") === "true";
  const shouldRegenerate = searchParams.get("regenerate") === "true";

  const {
    isLoading,
    isSoapLoading,
    isPrescriptionLoading,
    soapMissing,
    isGenerating,
    prescriptionMissing,
    prescription,
    generate,
  } = workspace;

  useEffect(() => {
    if (autoGenerateTriggeredRef.current) return;
    if (!shouldAutoGenerate && !shouldRegenerate) return;
    if (isLoading || isSoapLoading || isPrescriptionLoading) return;
    if (soapMissing || isGenerating) return;

    const canGenerate =
      prescriptionMissing || (shouldRegenerate && Boolean(prescription));
    if (!canGenerate) {
      router.replace(routes.app.consultationPrescription(consultationId));
      return;
    }

    autoGenerateTriggeredRef.current = true;
    router.replace(routes.app.consultationPrescription(consultationId));
    void generate(shouldRegenerate);
  }, [
    consultationId,
    generate,
    isGenerating,
    isLoading,
    isPrescriptionLoading,
    isSoapLoading,
    prescription,
    prescriptionMissing,
    router,
    shouldAutoGenerate,
    shouldRegenerate,
    soapMissing,
  ]);

  if (workspace.isLoading) {
    return <ShellSkeletonLoader />;
  }

  if (
    workspace.consultationError ||
    !workspace.consultation ||
    !workspace.patient
  ) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <ApiErrorDisplay
          error={
            (workspace.consultationError as Error) ??
            new Error("Unable to load consultation")
          }
        />
      </div>
    );
  }

  const patient = workspace.patient;
  const consultation = workspace.consultation;
  const consultationLabel = consultation.chief_complaint ?? "Consultation";

  const handleExportPdf = async () => {
    if (!workspace.prescription || !doctor) return;
    await workspace.logExport();
    void ExportService.exportPrescriptionPdf({
      htmlContent: workspace.htmlDraft,
      patientName: patient.full_name,
      doctorName: doctor.full_name,
      doctorRegistration: doctor.qualification ?? "",
      hospitalName: doctor.hospital_name ?? "AIRO Clinical",
      consultationLabel,
    });
  };

  const handlePrint = async () => {
    if (!workspace.prescription || !doctor) return;
    await workspace.logPrint();
    void ExportService.exportPrescriptionPdf({
      htmlContent: workspace.htmlDraft,
      patientName: patient.full_name,
      doctorName: doctor.full_name,
      doctorRegistration: doctor.qualification ?? "",
      hospitalName: doctor.hospital_name ?? "AIRO Clinical",
      consultationLabel,
      autoPrint: true,
    });
  };

  const isAutoGeneratePending =
    (shouldAutoGenerate || shouldRegenerate) &&
    workspace.prescriptionMissing &&
    !workspace.isGenerating;

  const showMissingPrescription =
    workspace.prescriptionMissing &&
    !workspace.isGenerating &&
    !workspace.prescription &&
    !isAutoGeneratePending;

  const isLoadingContent =
    workspace.isPrescriptionLoading || workspace.isGenerating || isAutoGeneratePending;

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-background">
      <PrescriptionCommandBar
        patientName={patient.full_name}
        consultationLabel={consultationLabel}
        isDirty={workspace.isDirty}
        isSaving={workspace.isSaving}
        isApproved={workspace.isApproved}
        isRevising={workspace.isRevising}
        isGenerating={workspace.isGenerating}
        isApproving={workspace.isApproving}
        hasPrescription={Boolean(workspace.prescription)}
        soapMissing={workspace.soapMissing}
        lastSavedAt={workspace.lastSavedAt}
        documentVersion={workspace.documentVersion}
        onGenerate={() => void workspace.generate()}
        onRegenerate={() => void workspace.generate(true)}
        onSave={() => void workspace.saveDraft()}
        onStartRevision={workspace.startRevision}
        onApprove={() => void workspace.approve()}
        onPrint={() => void handlePrint()}
        onExportPdf={() => void handleExportPdf()}
        onOpenAiAssistant={() => setAiOpen(true)}
      />

      <div className="flex min-h-0 flex-1">
        <PrescriptionSummarySidebar
          consultation={consultation}
          patient={patient}
          soap={workspace.soap}
          prescription={workspace.prescription}
          collapsed={sidebarCollapsed}
          onToggleCollapsed={() => setSidebarCollapsed((current) => !current)}
        />

        <main className="relative flex min-h-0 min-w-0 flex-1 flex-col">
          {workspace.soapMissing ? (
            <EmptySoapRequired consultationId={consultationId} />
          ) : workspace.soapNotApproved ? (
            <EmptySoapApprovalRequired consultationId={consultationId} />
          ) : showMissingPrescription ? (
            <EmptyPrescriptionState
              isGenerating={workspace.isGenerating}
              generationError={workspace.generationError}
              onGenerate={() => void workspace.generate()}
            />
          ) : isLoadingContent ? (
            <LoadingState
              message={
                workspace.isGenerating || isAutoGeneratePending
                  ? "Generating prescription from SOAP note…"
                  : "Loading prescription…"
              }
            />
          ) : (
            <PrescriptionHtmlEditor
              value={workspace.htmlDraft}
              version={workspace.documentVersion}
              readOnly={workspace.isReadOnly}
              onChange={workspace.setHtmlDraft}
            />
          )}

          {workspace.saveError ? (
            <p className="absolute bottom-4 left-1/2 z-20 max-w-lg -translate-x-1/2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-center text-sm text-red-400 shadow-lg backdrop-blur">
              {workspace.saveError}
            </p>
          ) : null}
        </main>
      </div>

      <AiAssistantDrawer open={aiOpen} onOpenChange={setAiOpen} />
    </div>
  );
}

function LoadingState({ message }: { message: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-[#e8eaed] dark:bg-zinc-950/80">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-background shadow-md">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">{message}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          This usually takes 10–30 seconds
        </p>
      </div>
    </div>
  );
}

function EmptySoapApprovalRequired({ consultationId }: { consultationId: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 bg-muted/20 p-8 text-center">
      <div className="rounded-2xl border border-dashed border-border/60 bg-background p-5 shadow-sm">
        <FileText className="h-10 w-10 text-muted-foreground" />
      </div>
      <div className="max-w-md space-y-2">
        <h2 className="text-xl font-semibold">SOAP approval required</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Prescriptions are generated only after the SOAP note is reviewed and
          approved. This ensures clinical documentation is finalized before
          prescribing.
        </p>
      </div>
      <Button type="button" asChild>
        <Link href={routes.app.consultationSoap(consultationId)}>
          Review SOAP note
        </Link>
      </Button>
    </div>
  );
}

function EmptySoapRequired({ consultationId }: { consultationId: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 bg-muted/20 p-8 text-center">
      <div className="rounded-2xl border border-dashed border-border/60 bg-background p-5 shadow-sm">
        <FileText className="h-10 w-10 text-muted-foreground" />
      </div>
      <div className="max-w-md space-y-2">
        <h2 className="text-xl font-semibold">SOAP note required</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Prescriptions are generated from your clinical SOAP note — never from
          raw transcripts. Complete the SOAP note first, then return here.
        </p>
      </div>
      <Button type="button" asChild>
        <Link href={routes.app.consultationSoap(consultationId)}>
          Open SOAP workspace
        </Link>
      </Button>
    </div>
  );
}

function EmptyPrescriptionState({
  isGenerating,
  generationError,
  onGenerate,
}: {
  isGenerating: boolean;
  generationError: string | null;
  onGenerate: () => void;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 bg-muted/20 p-8 text-center">
      <div className="rounded-2xl border border-dashed border-border/60 bg-background p-5 shadow-sm">
        <Sparkles className="h-10 w-10 text-primary" />
      </div>
      <div className="max-w-md space-y-2">
        <h2 className="text-xl font-semibold">Ready to generate</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          AI will build a structured prescription document from your SOAP note.
          You can edit every section before approving.
        </p>
      </div>
      <Button type="button" size="lg" onClick={onGenerate} disabled={isGenerating}>
        <Sparkles className="h-4 w-4" />
        {isGenerating ? "Generating…" : "Generate Prescription"}
      </Button>
      {generationError ? (
        <p className="text-sm text-red-400">{generationError}</p>
      ) : null}
    </div>
  );
}
