"use client";

import Link from "next/link";

import { AudioRecorderStatus } from "@/features/sessions/components/audio-recorder-status";
import { MicAccessBanner } from "@/features/sessions/components/mic-access-banner";
import { SessionControls } from "@/features/sessions/components/session-controls";
import { SessionHeader } from "@/features/sessions/components/session-header";
import { SessionMetrics } from "@/features/sessions/components/session-metrics";
import { TranscriptStream } from "@/features/sessions/components/transcript-stream";
import { useSessionWorkspace } from "@/features/sessions/hooks/use-session-workspace";
import { ConsultationStatusBadge } from "@/features/consultations/components/consultation-status-badge";
import { routes } from "@/shared/constants/routes";
import { ApiErrorDisplay } from "@/shared/ui/feedback/api-error";
import { ShellSkeletonLoader } from "@/shared/ui/feedback/skeleton-loader";

type SessionWorkspaceProps = {
  sessionId: string;
};

export function SessionWorkspace({ sessionId }: SessionWorkspaceProps) {
  const workspace = useSessionWorkspace(sessionId);

  if (workspace.isLoading) {
    return <ShellSkeletonLoader />;
  }

  if (!workspace.session || !workspace.consultation || !workspace.patient) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <ApiErrorDisplay
          error={
            workspace.error instanceof Error
              ? workspace.error
              : new Error(
                  typeof workspace.error === "string"
                    ? workspace.error
                    : "Unable to load session workspace",
                )
          }
        />
      </div>
    );
  }

  const patientName = workspace.patient.full_name;
  const consultationLabel =
    workspace.consultation.chief_complaint ?? "Consultation";

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-background">
      <SessionHeader
        patientName={patientName}
        consultationLabel={consultationLabel}
        session={workspace.session}
        elapsedMs={workspace.elapsedMs}
        connectionStatus={workspace.connectionStatus}
      />

      <div className="grid min-h-0 flex-1 gap-4 p-4 lg:grid-cols-[380px_1fr] lg:p-6">
        <aside className="space-y-4">
          {workspace.needsMicrophoneAccess ? (
            <MicAccessBanner
              onEnableMicrophone={() => void workspace.retryMicrophoneAccess()}
            />
          ) : null}
          <section className="rounded-xl border border-border/60 bg-card/50 p-4">
            <h3 className="text-sm font-medium">Patient</h3>
            <Link
              href={routes.app.patientDetail(workspace.patient.id)}
              className="mt-2 block text-lg font-semibold hover:underline"
            >
              {patientName}
            </Link>
            {workspace.patient.phone ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {workspace.patient.phone}
              </p>
            ) : null}
          </section>

          <section className="rounded-xl border border-border/60 bg-card/50 p-4">
            <h3 className="text-sm font-medium">Consultation</h3>
            <Link
              href={routes.app.consultationDetail(workspace.consultation.id)}
              className="mt-2 block font-medium hover:underline"
            >
              {consultationLabel}
            </Link>
            <div className="mt-3">
              <ConsultationStatusBadge status={workspace.consultation.status} />
            </div>
          </section>

          <section className="space-y-4 rounded-xl border border-border/60 bg-card/50 p-4">
            <h3 className="text-sm font-medium">Session controls</h3>
            <SessionControls
              canPause={workspace.controls.canPause}
              canResume={workspace.controls.canResume}
              canEnd={workspace.controls.canEnd}
              isEnding={workspace.controls.isEnding}
              onPause={() => void workspace.pauseRecording()}
              onResume={() => void workspace.resumeRecording()}
              onEnd={() => void workspace.endSession()}
            />
            {workspace.sessionError &&
            workspace.sessionError !== "Microphone permission denied" ? (
              <p className="text-sm text-red-400" role="alert">
                {workspace.sessionError}
              </p>
            ) : null}
          </section>

          <AudioRecorderStatus
            recordingState={workspace.recordingState}
            micPermission={workspace.micPermission}
            uploadBackpressure={workspace.uploadBackpressure}
          />

          <SessionMetrics
            elapsedMs={workspace.elapsedMs}
            transcriptSegmentCount={workspace.transcriptSegmentCount}
            chunksUploaded={workspace.chunksUploaded}
            chunksPending={workspace.chunksPending}
            chunksFailed={workspace.chunksFailed}
          />
        </aside>

        <section className="min-h-[420px] lg:min-h-0">
          <TranscriptStream
            segments={workspace.transcriptSegments}
            autoScrollEnabled={workspace.autoScrollEnabled}
            onAutoScrollChange={workspace.setAutoScrollEnabled}
            sessionStatus={workspace.session.status}
            recordingState={workspace.recordingState}
            chunksUploaded={workspace.chunksUploaded}
            lastChunkNumber={workspace.session.last_chunk_number}
          />
        </section>
      </div>
    </div>
  );
}
