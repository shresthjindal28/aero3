"use client";

import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown, MoreHorizontal } from "lucide-react";
import { useState } from "react";

import { DeletePatientDialog } from "@/features/patients/components/delete-patient-dialog";
import { useDeletePatient } from "@/features/patients/hooks/use-patient-mutations";
import type { Patient, PatientSortField, SortDirection } from "@/features/patients/types/patient.types";
import {
  calculateAge,
  formatGender,
  formatPatientCreatedDate,
} from "@/features/patients/utils/patient.utils";
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

type PatientTableProps = {
  patients: Patient[];
  isLoading?: boolean;
  sortField: PatientSortField;
  sortDirection: SortDirection;
  onSort: (field: PatientSortField) => void;
};

const columns: { key: PatientSortField; label: string }[] = [
  { key: "full_name", label: "Patient Name" },
  { key: "gender", label: "Gender" },
  { key: "phone", label: "Phone" },
  { key: "date_of_birth", label: "Age" },
  { key: "blood_group", label: "Blood Group" },
  { key: "created_at", label: "Created Date" },
];

function SortIcon({
  active,
  direction,
}: {
  active: boolean;
  direction: SortDirection;
}) {
  if (!active) return <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />;
  return direction === "asc" ? (
    <ArrowUp className="h-3.5 w-3.5" />
  ) : (
    <ArrowDown className="h-3.5 w-3.5" />
  );
}

function PatientActions({ patient }: { patient: Patient }) {
  const [open, setOpen] = useState(false);
  const deleteMutation = useDeletePatient();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`Actions for ${patient.full_name}`}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={routes.app.patientDetail(patient.id)}>View</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={routes.app.patientEdit(patient.id)}>Edit</Link>
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

      <DeletePatientDialog
        open={open}
        onOpenChange={setOpen}
        patientName={patient.full_name}
        isDeleting={deleteMutation.isPending}
        onConfirm={() => {
          deleteMutation.mutate(patient.id, {
            onSuccess: () => setOpen(false),
          });
        }}
      />
    </>
  );
}

export function PatientTable({
  patients,
  isLoading = false,
  sortField,
  sortDirection,
  onSort,
}: PatientTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
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
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3 font-medium text-muted-foreground">
                  <button
                    type="button"
                    onClick={() => onSort(column.key)}
                    className="inline-flex items-center gap-1.5 hover:text-foreground"
                  >
                    {column.label}
                    <SortIcon
                      active={sortField === column.key}
                      direction={sortDirection}
                    />
                  </button>
                </th>
              ))}
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr key={patient.id} className="border-t transition-colors hover:bg-muted/20">
                <td className="px-4 py-3">
                  <Link
                    href={routes.app.patientDetail(patient.id)}
                    className="font-medium hover:underline"
                  >
                    {patient.full_name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatGender(patient.gender)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{patient.phone ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {calculateAge(patient.date_of_birth)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {patient.blood_group ?? "—"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatPatientCreatedDate(patient.created_at)}
                </td>
                <td className="px-4 py-3 text-right">
                  <PatientActions patient={patient} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {patients.map((patient) => (
          <div key={patient.id} className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Link
                  href={routes.app.patientDetail(patient.id)}
                  className="font-medium hover:underline"
                >
                  {patient.full_name}
                </Link>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatGender(patient.gender)} · Age {calculateAge(patient.date_of_birth)} ·{" "}
                  {patient.blood_group ?? "No blood group"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{patient.phone ?? "No phone"}</p>
              </div>
              <PatientActions patient={patient} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
