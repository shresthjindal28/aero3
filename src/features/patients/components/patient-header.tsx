"use client";

import Link from "next/link";
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

import { DeletePatientDialog } from "@/features/patients/components/delete-patient-dialog";
import { useDeletePatient } from "@/features/patients/hooks/use-patient-mutations";
import type { Patient } from "@/features/patients/types/patient.types";
import {
  calculateAge,
  formatGender,
} from "@/features/patients/utils/patient.utils";
import { routes } from "@/shared/constants/routes";
import { Button } from "@/shared/ui/primitives/button";

type PatientHeaderProps = {
  patient: Patient;
  extraActions?: React.ReactNode;
};

export function PatientHeader({ patient, extraActions }: PatientHeaderProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const deleteMutation = useDeletePatient();

  return (
    <>
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Patient</p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight">{patient.full_name}</h1>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                Age {calculateAge(patient.date_of_birth)}
              </span>
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                {formatGender(patient.gender)}
              </span>
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                {patient.blood_group ?? "Blood group N/A"}
              </span>
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                {patient.phone ?? "No phone"}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {extraActions}
            <Button asChild variant="outline">
              <Link href={routes.app.patientEdit(patient.id)}>
                <Pencil className="h-4 w-4" />
                Edit patient
              </Link>
            </Button>
            <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <DeletePatientDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        patientName={patient.full_name}
        isDeleting={deleteMutation.isPending}
        onConfirm={() => {
          deleteMutation.mutate(patient.id, {
            onSuccess: () => setDeleteOpen(false),
          });
        }}
      />
    </>
  );
}
