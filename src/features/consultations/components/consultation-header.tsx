"use client";

import Link from "next/link";
import { useState } from "react";
import { Mic, Pencil, Trash2 } from "lucide-react";

import { ConsultationStatusBadge } from "@/features/consultations/components/consultation-status-badge";
import { DeleteConsultationDialog } from "@/features/consultations/components/delete-consultation-dialog";
import { EditConsultationDialog } from "@/features/consultations/components/edit-consultation-dialog";
import { useDeleteConsultation } from "@/features/consultations/hooks/use-consultation-mutations";
import { useStartSession } from "@/features/sessions/hooks/use-session-mutations";
import type { Consultation } from "@/features/consultations/types/consultation.types";
import { formatDuration } from "@/features/consultations/utils/consultation.utils";
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

  return (
    <>
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <div>
              <Link
                href={routes.app.patientDetail(consultation.patient_id)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                {patientName}
              </Link>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight">
                {consultation.chief_complaint ?? "Consultation"}
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <ConsultationStatusBadge status={consultation.status} />
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                Duration {formatDuration(consultation.duration_seconds)}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="default"
              disabled={startSessionMutation.isPending}
              onClick={() => startSessionMutation.mutate()}
            >
              <Mic className="h-4 w-4" />
              Start session
            </Button>
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4" />
              Edit consultation
            </Button>
            <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
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
        consultationLabel={consultation.chief_complaint ?? "this consultation"}
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
