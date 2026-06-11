"use client";

import { FileText, Plus } from "lucide-react";

import { AiCopilotPanel } from "@/shared/copilot/ai-copilot-panel";
import { ExportService } from "@/shared/export/export.service";
import { ConsultationInfoPanel } from "@/features/soap/components/consultation-info-panel";
import { SoapActions } from "@/features/soap/components/soap-actions";
import { SoapEditor } from "@/features/soap/components/soap-editor";
import { SoapHeader } from "@/features/soap/components/soap-header";
import { TranscriptViewer } from "@/features/soap/components/transcript-viewer";
import { useResizablePanels } from "@/features/soap/hooks/use-resizable-panels";
import { useSoapWorkspace } from "@/features/soap/hooks/use-soap-workspace";
import { cn } from "@/lib/utils/cn";
import { ApiErrorDisplay } from "@/shared/ui/feedback/api-error";
import { ShellSkeletonLoader } from "@/shared/ui/feedback/skeleton-loader";
import { Button } from "@/shared/ui/primitives/button";

type SoapWorkspaceProps = {
  consultationId: string;
};

function ResizeHandle({
  onPointerDown,
}: {
  onPointerDown: () => void;
}) {
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      onPointerDown={onPointerDown}
      className="group relative w-1 shrink-0 cursor-col-resize"
    >
      <div className="absolute inset-y-0 -left-1 -right-1" />
      <div className="mx-auto h-full w-px bg-border/60 transition-colors group-hover:bg-primary/50" />
    </div>
  );
}

export function SoapWorkspace({ consultationId }: SoapWorkspaceProps) {
  const workspace = useSoapWorkspace(consultationId);
  const { containerRef, leftWidth, rightWidth, startDragging } =
    useResizablePanels({
      initialLeft: 300,
      initialRight: 360,
    });

  if (workspace.isLoading) {
    return <ShellSkeletonLoader />;
  }

  if (workspace.consultationError || !workspace.consultation || !workspace.patient) {
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

  const patientName = workspace.patient.full_name;
  const consultationLabel =
    workspace.consultation.chief_complaint ?? "Consultation";
  const showMissingSoap =
    workspace.soapMissing && !workspace.isCreating && !workspace.soap;

  const handleExportPdf = () => {
    void ExportService.exportSoapPdf({
      patientName,
      consultationLabel,
      sections: {
        subjective: workspace.draft.subjective,
        objective: workspace.draft.objective,
        assessment: workspace.draft.assessment,
        plan: workspace.draft.plan,
      },
    });
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-background">
      <SoapHeader
        patientName={patientName}
        consultation={workspace.consultation}
        soap={workspace.soap}
        isDirty={workspace.isDirty}
        isSaving={workspace.isSaving}
      />

      <div className="flex min-h-0 flex-1">
        <div
          ref={containerRef}
          className="grid min-h-0 min-w-0 flex-1"
          style={{
            gridTemplateColumns: `${leftWidth}px 4px minmax(0, 1fr) 4px ${rightWidth}px`,
          }}
        >
          <div className="min-h-0 min-w-0 p-4 pr-0">
            <ConsultationInfoPanel
              consultation={workspace.consultation}
              patient={workspace.patient}
              soap={workspace.soap}
            />
          </div>

          <ResizeHandle onPointerDown={() => startDragging("left")} />

          <div className="relative flex min-h-0 min-w-0 flex-col">
            {showMissingSoap ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
                <div className="rounded-full border border-dashed border-border/60 p-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="max-w-md space-y-2">
                  <h2 className="text-lg font-semibold">No SOAP note yet</h2>
                  <p className="text-sm text-muted-foreground">
                    AIRO will generate a SOAP note after the consultation. You can
                    also start a blank draft to begin documenting manually.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={() => void workspace.createEmptySoap()}
                  disabled={workspace.isCreating}
                >
                  <Plus className="h-4 w-4" />
                  Create draft
                </Button>
              </div>
            ) : workspace.isSoapLoading ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Loading SOAP note…
              </div>
            ) : (
              <div className="flex h-full min-h-0 flex-col rounded-xl border border-border/60 bg-card/30">
                <SoapEditor
                  draft={workspace.draft}
                  collapsedSections={workspace.collapsedSections}
                  readOnly={workspace.isApproved}
                  onSectionChange={workspace.updateSection}
                  onToggleSection={workspace.toggleSection}
                />
                <SoapActions
                  canSave={workspace.isDirty && !workspace.isApproved}
                  canApprove={Boolean(workspace.soap) && !workspace.isApproved}
                  isSaving={workspace.isSaving}
                  isApproving={workspace.isApproving}
                  isApproved={workspace.isApproved}
                  onSave={() => void workspace.saveDraft()}
                  onApprove={() => void workspace.approveSoap()}
                  onExportPdf={handleExportPdf}
                />
              </div>
            )}

            {workspace.saveError ? (
              <p className="absolute bottom-20 left-4 right-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                {workspace.saveError}
              </p>
            ) : null}
          </div>

          <ResizeHandle onPointerDown={() => startDragging("right")} />

          <div className={cn("min-h-0 min-w-0 p-4 pl-0")}>
            <TranscriptViewer
              transcript={workspace.transcript}
              isLoading={workspace.isTranscriptLoading}
              isMissing={workspace.transcriptMissing}
              onRetry={() => void workspace.refetchTranscript()}
            />
          </div>
        </div>

        <AiCopilotPanel />
      </div>
    </div>
  );
}
