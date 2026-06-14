"use client";

import Link from "next/link";
import { useState } from "react";
import { Mic } from "lucide-react";

import { ConsultationMoreMenu } from "@/features/consultations/components/consultation-more-menu";
import { ConsultationStatusBadge } from "@/features/consultations/components/consultation-status-badge";
import { DeleteConsultationDialog } from "@/features/consultations/components/delete-consultation-dialog";
import { EditConsultationDialog } from "@/features/consultations/components/edit-consultation-dialog";
import { useDeleteConsultation } from "@/features/consultations/hooks/use-consultation-mutations";
import type { Consultation } from "@/features/consultations/types/consultation.types";
import { formatDuration } from "@/features/consultations/utils/consultation.utils";
import { useActiveSessionsMap } from "@/features/sessions/hooks/use-active-sessions-map";
import { useStartSession } from "@/features/sessions/hooks/use-session-mutations";
import { routes } from "@/shared/constants/routes";
import { Button } from "@/shared/ui/primitives/button";

type ConsultationHeaderProps = {
  consultation: Consultation;
  patientName: string;
};

export function ConsultationHeader({
  consultation,
  patientName,
}: ConsultationHeaderProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const deleteMutation = useDeleteConsultation(consultation.patient_id);
  const startSessionMutation = useStartSession(consultation.id);
  const { sessionByConsultationId } = useActiveSessionsMap([consultation.id]);
  const activeSession = sessionByConsultationId.get(consultation.id);
  const hasDuration = (consultation.duration_seconds ?? 0) > 0;

  return (
    <>
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div>
              <Link
                href={routes.app.patientDetail(consultation.patient_id)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                {patientName}
              </Link>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                {consultation.chief_complaint ?? "Visit"}
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <ConsultationStatusBadge status={consultation.status} />
              {hasDuration ? (
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  {formatDuration(consultation.duration_seconds)} elapsed
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {activeSession ? (
              <Button asChild>
                <Link href={routes.app.sessionDetail(activeSession.id)}>
                  <Mic className="h-4 w-4" />
                  Continue visit
                </Link>
              </Button>
            ) : (
              <Button
                variant="default"
                disabled={startSessionMutation.isPending}
                onClick={() => startSessionMutation.mutate()}
              >
                <Mic className="h-4 w-4" />
                Begin visit
              </Button>
            )}
            <ConsultationMoreMenu
              onEdit={() => setEditOpen(true)}
              onDelete={() => setDeleteOpen(true)}
            />
          </div>
        </div>
      </div>

      <EditConsultationDialog
        consultation={consultation}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <DeleteConsultationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        consultationLabel={consultation.chief_complaint ?? "this visit"}
        isDeleting={deleteMutation.isPending}
        onConfirm={() => {
          deleteMutation.mutate(consultation.id, {
            onSuccess: () => setDeleteOpen(false),
          });
        }}
      />
    </>
  );
}
