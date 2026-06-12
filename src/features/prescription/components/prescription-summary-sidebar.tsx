"use client";

import Link from "next/link";

import type { Consultation } from "@/features/consultations/types/consultation.types";
import type { Patient } from "@/features/patients/types/patient.types";
import {
  calculateAge,
  formatGender,
} from "@/features/patients/utils/patient.utils";
import type { Prescription } from "@/features/prescription/types/prescription.types";
import type { SoapNote } from "@/features/soap/types/soap.types";
import { ApprovalBadge } from "@/features/soap/components/approval-badge";
import { routes } from "@/shared/constants/routes";
import { cn } from "@/lib/utils/cn";

type PrescriptionSummarySidebarProps = {
  consultation: Consultation;
  patient: Patient;
  soap: SoapNote | null | undefined;
  prescription: Prescription | null | undefined;
};

function StatusPill({
  label,
  approved,
}: {
  label: string;
  approved: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium",
        approved
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
          : "border-amber-500/30 bg-amber-500/10 text-amber-500",
      )}
    >
      {label}
    </span>
  );
}

export function PrescriptionSummarySidebar({
  consultation,
  patient,
  soap,
  prescription,
}: PrescriptionSummarySidebarProps) {
  return (
    <aside className="flex h-full w-[15%] min-w-[200px] shrink-0 flex-col border-r border-border/60 bg-card/20">
      <div className="border-b border-border/60 px-4 py-3">
        <h2 className="text-sm font-medium">Consultation</h2>
      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4">
        <Field label="Patient" value={patient.full_name} prominent />
        <Field label="Age" value={calculateAge(patient.date_of_birth)} />
        <Field label="Gender" value={formatGender(patient.gender)} />
        <Field
          label="Chief complaint"
          value={consultation.chief_complaint ?? "—"}
        />

        <div className="space-y-2">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            SOAP status
          </p>
          {soap ? (
            <ApprovalBadge soap={soap} />
          ) : (
            <StatusPill label="Not created" approved={false} />
          )}
        </div>

        <div className="space-y-2">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Prescription status
          </p>
          {prescription ? (
            <StatusPill
              label={prescription.approved_by_doctor ? "Approved" : "Draft"}
              approved={prescription.approved_by_doctor}
            />
          ) : (
            <StatusPill label="Not generated" approved={false} />
          )}
        </div>

        <Link
          href={routes.app.consultationSoap(consultation.id)}
          className="inline-block text-sm text-primary hover:underline"
        >
          Open SOAP workspace
        </Link>
      </div>
    </aside>
  );
}

function Field({
  label,
  value,
  prominent = false,
}: {
  label: string;
  value: string;
  prominent?: boolean;
}) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className={cn("text-sm", prominent && "font-semibold")}>{value}</p>
    </div>
  );
}
