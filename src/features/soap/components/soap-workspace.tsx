"use client";

import { FileText, FileTextIcon, Sparkles, User } from "lucide-react";

import { ExportService } from "@/shared/export/export.service";
import { useIsMobile, useIsTablet } from "@/shared/hooks/use-media-query";
import { AiAssistantDrawer } from "@/features/soap/components/ai-assistant-drawer";
import { ConsultationDetailsDrawer } from "@/features/soap/components/consultation-details-drawer";
import { ConsultationSidebar } from "@/features/soap/components/consultation-sidebar";
import { SoapCommandBar } from "@/features/soap/components/soap-command-bar";
import { SoapEditor } from "@/features/soap/components/soap-editor";
import { TranscriptDrawer } from "@/features/soap/components/transcript-drawer";
import { TranscriptPanel } from "@/features/soap/components/transcript-panel";
import { useSoapWorkspaceLayout } from "@/features/soap/hooks/use-soap-workspace-layout";
import { useSoapWorkspace } from "@/features/soap/hooks/use-soap-workspace";
import { useCacheWarm } from "@/features/voice-agent/hooks/use-cache-warm";
import { ApiErrorDisplay } from "@/shared/ui/feedback/api-error";
import { ShellSkeletonLoader } from "@/shared/ui/feedback/skeleton-loader";
import { Button } from "@/shared/ui/primitives/button";

type SoapWorkspaceProps = {
  consultationId: string;
};

export function SoapWorkspace({ consultationId }: SoapWorkspaceProps) {
  const workspace = useSoapWorkspace(consultationId);
  useCacheWarm(workspace.patient?.id, Boolean(workspace.patient?.id));
  const layout = useSoapWorkspaceLayout();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

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
    workspace.soapMissing &&
    !workspace.isCreating &&
    !workspace.isGenerating &&
    !workspace.soap;
  const canGenerate = Boolean(workspace.soap) && !workspace.isApproved;
  const showDesktopTranscript = !isMobile && !isTablet;

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
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-background">
      <SoapCommandBar
        consultation={workspace.consultation}
        patientName={patientName}
        soap={workspace.soap}
        isDirty={workspace.isDirty}
        isSaving={workspace.isSaving}
        isApproved={workspace.isApproved}
        isGenerating={workspace.isGenerating}
        isApproving={workspace.isApproving}
        canGenerate={canGenerate}
        hasSoap={Boolean(workspace.soap)}
        transcriptMissing={workspace.transcriptMissing}
        lastSavedAt={workspace.lastSavedAt}
        onGenerate={() => void workspace.generateSoapNote()}
        onRegenerate={() => void workspace.generateSoapNote(true)}
        onApprove={() => void workspace.approveSoap()}
        onExportPdf={handleExportPdf}
        onOpenAiAssistant={() => layout.setAiAssistantOpen(true)}
      />

      {isTablet || isMobile ? (
        <div className="flex items-center gap-2 border-b border-border/60 px-4 py-2 lg:hidden">
          {isMobile ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => layout.setConsultationDetailsOpen(true)}
            >
              <User className="h-4 w-4" />
              Patient
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => layout.setTranscriptDrawerOpen(true)}
          >
            <FileTextIcon className="h-4 w-4" />
            Transcript
          </Button>
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1">
        {!isMobile ? (
          <ConsultationSidebar
            consultation={workspace.consultation}
            patient={workspace.patient}
            collapsed={layout.consultationSidebarCollapsed}
            onToggleCollapsed={layout.toggleConsultationSidebar}
            onOpenDetails={() => layout.setConsultationDetailsOpen(true)}
          />
        ) : null}

        <main className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-background">
          {showMissingSoap ? (
            <EmptySoapState
              isGenerating={workspace.isGenerating}
              transcriptMissing={workspace.transcriptMissing}
              generationError={workspace.generationError}
              onGenerate={() => void workspace.generateSoapNote()}
            />
          ) : workspace.isSoapLoading || workspace.isGenerating ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              {workspace.isGenerating
                ? "AI is generating your SOAP note…"
                : "Loading SOAP note…"}
            </div>
          ) : (
            <SoapEditor
              draft={workspace.draft}
              readOnly={workspace.isApproved}
              isDirty={workspace.isDirty}
              isSaving={workspace.isSaving}
              lastSavedAt={workspace.lastSavedAt}
              onSectionChange={workspace.updateSection}
            />
          )}

          {workspace.saveError ? (
            <p className="absolute bottom-4 left-4 right-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {workspace.saveError}
            </p>
          ) : null}
        </main>

        {showDesktopTranscript ? (
          <div
            className="shrink-0 transition-[width] duration-200 ease-out"
            style={{ width: layout.transcriptWidth }}
          >
            <TranscriptPanel
              transcript={workspace.transcript}
              isLoading={workspace.isTranscriptLoading}
              isMissing={workspace.transcriptMissing}
              collapsed={layout.transcriptCollapsed}
              expanded={layout.transcriptExpanded}
              onToggleCollapsed={layout.toggleTranscriptCollapsed}
              onToggleExpanded={layout.toggleTranscriptExpanded}
              onRetry={() => void workspace.refetchTranscript()}
            />
          </div>
        ) : null}
      </div>

      <ConsultationDetailsDrawer
        open={layout.consultationDetailsOpen}
        onOpenChange={layout.setConsultationDetailsOpen}
        consultation={workspace.consultation}
        patient={workspace.patient}
        soap={workspace.soap}
      />

      <AiAssistantDrawer
        open={layout.aiAssistantOpen}
        onOpenChange={layout.setAiAssistantOpen}
        patientId={workspace.patient?.id}
        consultationId={consultationId}
      />

      <TranscriptDrawer
        open={layout.transcriptDrawerOpen}
        onOpenChange={layout.setTranscriptDrawerOpen}
        transcript={workspace.transcript}
        isLoading={workspace.isTranscriptLoading}
        isMissing={workspace.transcriptMissing}
        onRetry={() => void workspace.refetchTranscript()}
      />
    </div>
  );
}

function EmptySoapState({
  isGenerating,
  transcriptMissing,
  generationError,
  onGenerate,
}: {
  isGenerating: boolean;
  transcriptMissing: boolean;
  generationError: string | null;
  onGenerate: () => void;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="rounded-full border border-dashed border-border/60 p-5">
        <FileText className="h-10 w-10 text-muted-foreground" />
      </div>
      <div className="max-w-md space-y-2">
        <h2 className="text-xl font-semibold">No SOAP note yet</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Generate a structured SOAP note from the consultation transcript. You
          can review and edit each section before approving.
        </p>
      </div>
      <Button
        type="button"
        onClick={onGenerate}
        disabled={isGenerating || transcriptMissing}
      >
        <Sparkles className="h-4 w-4" />
        {isGenerating ? "Generating…" : "Generate SOAP note"}
      </Button>
      {transcriptMissing ? (
        <p className="text-xs text-muted-foreground">
          Finish the session and wait for the transcript to finalize first.
        </p>
      ) : null}
      {generationError ? (
        <p className="text-sm text-red-400">{generationError}</p>
      ) : null}
    </div>
  );
}
