"use client";

import Link from "next/link";

import { ConsultationStatusBadge } from "@/features/consultations/components/consultation-status-badge";
import type { Consultation } from "@/features/consultations/types/consultation.types";
import { formatDuration } from "@/features/consultations/utils/consultation.utils";
import type { Patient } from "@/features/patients/types/patient.types";
import {
  calculateAge,
  formatGender,
} from "@/features/patients/utils/patient.utils";
import { ApprovalBadge } from "@/features/soap/components/approval-badge";
import type { SoapNote } from "@/features/soap/types/soap.types";
import { formatDateTime } from "@/lib/utils/date";
import { routes } from "@/shared/constants/routes";
import {
  Sheet,
  SheetContent,
  SheetOverlay,
  SheetPortal,
} from "@/shared/ui/primitives/sheet";

type ConsultationDetailsDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  consultation: Consultation;
  patient: Patient;
  soap: SoapNote | null | undefined;
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1 border-b border-border/40 py-3 last:border-0">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="text-sm">{value}</p>
    </div>
  );
}

export function ConsultationDetailsDrawer({
  open,
  onOpenChange,
  consultation,
  patient,
  soap,
}: ConsultationDetailsDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetPortal>
        <SheetOverlay />
        <SheetContent side="left" className="w-full max-w-sm sm:max-w-md">
          <div className="flex h-full flex-col overflow-y-auto p-6 pt-12">
            <h2 className="text-lg font-semibold">Consultation details</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Full context for this visit
            </p>

            <div className="mt-6">
              <DetailRow label="Patient" value={patient.full_name} />
              {patient.phone ? (
                <DetailRow label="Phone" value={patient.phone} />
              ) : null}
              <DetailRow label="Age" value={calculateAge(patient.date_of_birth)} />
              <DetailRow label="Gender" value={formatGender(patient.gender)} />
              <DetailRow
                label="Chief complaint"
                value={consultation.chief_complaint ?? "—"}
              />
              <DetailRow
                label="Duration"
                value={formatDuration(consultation.duration_seconds)}
              />
              <DetailRow
                label="Started"
                value={
                  consultation.started_at
                    ? formatDateTime(consultation.started_at)
                    : "Not started"
                }
              />
              <DetailRow
                label="Ended"
                value={
                  consultation.ended_at
                    ? formatDateTime(consultation.ended_at)
                    : "Not ended"
                }
              />
              <div className="space-y-2 border-b border-border/40 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Consultation status
                </p>
                <ConsultationStatusBadge status={consultation.status} />
              </div>
              <div className="space-y-2 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  SOAP approval
                </p>
                <ApprovalBadge soap={soap} />
                {soap?.approved_by_doctor ? (
                  <p className="text-xs text-muted-foreground">
                    Approved by doctor
                    {soap.approved_at ? ` · ${formatDateTime(soap.approved_at)}` : ""}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Pending doctor approval
                  </p>
                )}
              </div>
            </div>

            <Link
              href={routes.app.consultationDetail(consultation.id)}
              className="mt-6 text-sm text-primary hover:underline"
            >
              View full consultation page
            </Link>
          </div>
        </SheetContent>
      </SheetPortal>
    </Sheet>
  );
}
