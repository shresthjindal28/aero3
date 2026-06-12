"use client";

import { FileText, Sparkles } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { AiAssistantDrawer } from "@/features/soap/components/ai-assistant-drawer";
import { PrescriptionCommandBar } from "@/features/prescription/components/prescription-command-bar";
import { PrescriptionHtmlEditor } from "@/features/prescription/components/prescription-html-editor";
import { PrescriptionSummarySidebar } from "@/features/prescription/components/prescription-summary-sidebar";
import { usePrescriptionWorkspace } from "@/features/prescription/hooks/use-prescription-workspace";
import { ExportService } from "@/shared/export/export.service";
import { useDoctorMe } from "@/features/auth/hooks/use-doctor-auth";
import { ApiErrorDisplay } from "@/shared/ui/feedback/api-error";
import { ShellSkeletonLoader } from "@/shared/ui/feedback/skeleton-loader";
import { Button } from "@/shared/ui/primitives/button";
import { routes } from "@/shared/constants/routes";
import Link from "next/link";

type PrescriptionWorkspaceProps = {
  consultationId: string;
};

export function PrescriptionWorkspace({ consultationId }: PrescriptionWorkspaceProps) {
  const workspace = usePrescriptionWorkspace(consultationId);
  const { data: doctor } = useDoctorMe(Boolean(workspace.consultation));
  const [aiOpen, setAiOpen] = useState(false);
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

  const patient = workspace.patient!;
  const consultation = workspace.consultation!;

  const handleExportPdf = async () => {
    if (!workspace.prescription || !doctor) return;
    await workspace.logExport();
    void ExportService.exportPrescriptionPdf({
      htmlContent: workspace.htmlDraft,
      patientName: patient.full_name,
      doctorName: doctor.full_name,
      doctorRegistration: doctor.qualification ?? "",
      hospitalName: doctor.hospital_name ?? "AIRO Clinical",
      consultationLabel: consultation.chief_complaint ?? "Consultation",
    });
  };

  const handlePrint = async () => {
    if (!workspace.prescription || !doctor) return;
    await workspace.logExport();
    void ExportService.exportPrescriptionPdf({
      htmlContent: workspace.htmlDraft,
      patientName: patient.full_name,
      doctorName: doctor.full_name,
      doctorRegistration: doctor.qualification ?? "",
      hospitalName: doctor.hospital_name ?? "AIRO Clinical",
      consultationLabel: consultation.chief_complaint ?? "Consultation",
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

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-background">
      <PrescriptionCommandBar
        isDirty={workspace.isDirty}
        isSaving={workspace.isSaving}
        isApproved={workspace.isApproved}
        isGenerating={workspace.isGenerating}
        isApproving={workspace.isApproving}
        hasPrescription={Boolean(workspace.prescription)}
        soapMissing={workspace.soapMissing}
        lastSavedAt={workspace.lastSavedAt}
        documentVersion={workspace.documentVersion}
        onGenerate={() => void workspace.generate()}
        onRegenerate={() => void workspace.generate(true)}
        onSave={() => void workspace.saveDraft()}
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
        />

        <main className="relative flex min-h-0 min-w-0 flex-[0_0_65%] flex-col">
          {workspace.soapMissing ? (
            <EmptySoapRequired consultationId={consultationId} />
          ) : showMissingPrescription ? (
            <EmptyPrescriptionState
              isGenerating={workspace.isGenerating}
              generationError={workspace.generationError}
              onGenerate={() => void workspace.generate()}
            />
          ) : workspace.isPrescriptionLoading ||
            workspace.isGenerating ||
            isAutoGeneratePending ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-6 w-6 animate-pulse" />
              {workspace.isGenerating || isAutoGeneratePending
                ? "AI is generating your prescription…"
                : "Loading prescription…"}
            </div>
          ) : (
            <PrescriptionHtmlEditor
              value={workspace.htmlDraft}
              version={workspace.documentVersion}
              readOnly={workspace.isApproved}
              onChange={workspace.setHtmlDraft}
            />
          )}

          {workspace.saveError ? (
            <p className="absolute bottom-4 left-4 right-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {workspace.saveError}
            </p>
          ) : null}
        </main>
      </div>

      <AiAssistantDrawer open={aiOpen} onOpenChange={setAiOpen} />
    </div>
  );
}

function EmptySoapRequired({ consultationId }: { consultationId: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
      <FileText className="h-10 w-10 text-muted-foreground" />
      <div className="max-w-md space-y-2">
        <h2 className="text-xl font-semibold">SOAP note required</h2>
        <p className="text-sm text-muted-foreground">
          Prescriptions are generated from an approved clinical SOAP note — never
          directly from transcripts. Create a SOAP note first.
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
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
      <Sparkles className="h-10 w-10 text-muted-foreground" />
      <div className="max-w-md space-y-2">
        <h2 className="text-xl font-semibold">No prescription yet</h2>
        <p className="text-sm text-muted-foreground">
          Generate a structured prescription from the SOAP note. You can review
          and edit the HTML document before approving.
        </p>
      </div>
      <Button type="button" onClick={onGenerate} disabled={isGenerating}>
        <Sparkles className="h-4 w-4" />
        {isGenerating ? "Generating…" : "Generate Prescription"}
      </Button>
      {generationError ? (
        <p className="text-sm text-red-400">{generationError}</p>
      ) : null}
    </div>
  );
}
