"use client";

import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";

import { ConsultationCard } from "@/features/consultations/components/consultation-card";
import { ConsultationStatusBadge } from "@/features/consultations/components/consultation-status-badge";
import { DeleteConsultationDialog } from "@/features/consultations/components/delete-consultation-dialog";
import { useDeleteConsultation } from "@/features/consultations/hooks/use-consultation-mutations";
import type { Consultation } from "@/features/consultations/types/consultation.types";
import {
  formatConsultationDate,
  formatDuration,
} from "@/features/consultations/utils/consultation.utils";
import { routes } from "@/shared/constants/routes";
import { Button } from "@/shared/ui/primitives/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/primitives/dropdown-menu";
import { Skeleton } from "@/shared/ui/primitives/skeleton";

type ConsultationTableProps = {
  consultations: Consultation[];
  patientId?: string;
  isLoading?: boolean;
};

function ConsultationRowActions({
  consultation,
  patientId,
}: {
  consultation: Consultation;
  patientId?: string;
}) {
  const [open, setOpen] = useState(false);
  const deleteMutation = useDeleteConsultation(patientId);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Consultation actions">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={routes.app.consultationDetail(consultation.id)}>View</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setOpen(true)}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteConsultationDialog
        open={open}
        onOpenChange={setOpen}
        consultationLabel={consultation.chief_complaint ?? "this consultation"}
        isDeleting={deleteMutation.isPending}
        onConfirm={() => {
          deleteMutation.mutate(consultation.id, {
            onSuccess: () => setOpen(false),
          });
        }}
      />
    </>
  );
}

export function ConsultationTable({
  consultations,
  patientId,
  isLoading = false,
}: ConsultationTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border md:block">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr className="text-left">
              <th className="px-4 py-3 font-medium text-muted-foreground">Date</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Chief Complaint</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Duration</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {consultations.map((consultation) => (
              <tr key={consultation.id} className="border-t hover:bg-muted/20">
                <td className="px-4 py-3 text-muted-foreground">
                  {formatConsultationDate(consultation.created_at)}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={routes.app.consultationDetail(consultation.id)}
                    className="font-medium hover:underline"
                  >
                    {consultation.chief_complaint ?? "No chief complaint"}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <ConsultationStatusBadge status={consultation.status} />
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDuration(consultation.duration_seconds)}
                </td>
                <td className="px-4 py-3 text-right">
                  <ConsultationRowActions
                    consultation={consultation}
                    patientId={patientId}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {consultations.map((consultation) => (
          <ConsultationCard key={consultation.id} consultation={consultation} />
        ))}
      </div>
    </>
  );
}
