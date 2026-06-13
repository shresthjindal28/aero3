"use client";

import Link from "next/link";

import { PrescriptionVersionPanel } from "@/features/prescription/components/prescription-version-panel";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";

import { formatChiefComplaint } from "@/lib/utils/format";
import type { Consultation } from "@/features/consultations/types/consultation.types";
import type { Patient } from "@/features/patients/types/patient.types";
import {
  calculateAge,
  formatGender,
} from "@/features/patients/utils/patient.utils";
import type { Prescription } from "@/features/prescription/types/prescription.types";
import type { SoapNote } from "@/features/soap/types/soap.types";
import { formatDateTime } from "@/lib/utils/date";
import { routes } from "@/shared/constants/routes";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/shared/ui/primitives/button";

type PrescriptionSummarySidebarProps = {
  consultation: Consultation;
  patient: Patient;
  soap: SoapNote | null | undefined;
  prescription: Prescription | null | undefined;
  collapsed: boolean;
  onToggleCollapsed: () => void;
};

export function PrescriptionSummarySidebar({
  consultation,
  patient,
  soap,
  prescription,
  collapsed,
  onToggleCollapsed,
}: PrescriptionSummarySidebarProps) {
  if (collapsed) {
    return (
      <aside className="flex h-full w-11 shrink-0 flex-col items-center border-r border-border/60 bg-card/30 py-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onToggleCollapsed}
          aria-label="Expand consultation panel"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </aside>
    );
  }

  return (
    <aside className="flex h-full w-[260px] shrink-0 flex-col border-r border-border/60 bg-card/30">
      <div className="flex items-center justify-between border-b border-border/60 px-3 py-2.5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Consultation
        </h2>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onToggleCollapsed}
          aria-label="Collapse consultation panel"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <div className="rounded-xl border border-border/50 bg-background/60 p-4 shadow-sm">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Patient
          </p>
          <p className="mt-1 text-base font-semibold leading-snug">
            {patient.full_name}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <MiniStat label="Age" value={calculateAge(patient.date_of_birth)} />
            <MiniStat label="Gender" value={formatGender(patient.gender)} />
          </div>
        </div>

        <div className="mt-4 space-y-1">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Chief complaint
          </p>
          <p className="text-sm leading-relaxed">
            {consultation.chief_complaint
              ? formatChiefComplaint(consultation.chief_complaint)
              : "—"}
          </p>
        </div>

        <div className="mt-6 space-y-3">
          <WorkflowStep
            label="SOAP note"
            status={
              soap
                ? soap.approved_by_doctor
                  ? "approved"
                  : "draft"
                : "missing"
            }
            detail={
              soap?.approved_at
                ? formatDateTime(soap.approved_at)
                : soap
                  ? "Pending approval"
                  : undefined
            }
          />
          <WorkflowStep
            label="Prescription"
            status={
              prescription
                ? prescription.is_approved || prescription.approved_by_doctor
                  ? "approved"
                  : "draft"
                : "missing"
            }
            detail={
              prescription?.updated_at
                ? `Updated ${formatDateTime(prescription.updated_at)}`
                : undefined
            }
          />
        </div>

        {prescription && prescription.version_number > 1 ? (
          <PrescriptionVersionPanel
            prescriptionId={prescription.id}
            activeVersionId={prescription.id}
            className="mt-6"
          />
        ) : null}

        <Link
          href={routes.app.consultationSoap(consultation.id)}
          className="mt-6 flex items-center gap-2 rounded-lg border border-border/50 bg-background/40 px-3 py-2.5 text-sm text-primary transition-colors hover:bg-background/80"
        >
          <FileText className="h-4 w-4 shrink-0" />
          Open SOAP workspace
        </Link>

        {prescription ? (
          <Link
            href={routes.app.prescriptionDetail(prescription.id)}
            className="mt-2 flex items-center gap-2 rounded-lg border border-border/50 bg-background/40 px-3 py-2.5 text-sm text-primary transition-colors hover:bg-background/80"
          >
            View clinical record
          </Link>
        ) : null}
      </div>
    </aside>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 font-medium">{value}</p>
    </div>
  );
}

function WorkflowStep({
  label,
  status,
  detail,
}: {
  label: string;
  status: "approved" | "draft" | "missing";
  detail?: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border/40 bg-background/40 px-3 py-2.5">
      <div
        className={cn(
          "mt-1 h-2 w-2 shrink-0 rounded-full",
          status === "approved" && "bg-emerald-500",
          status === "draft" && "bg-amber-500",
          status === "missing" && "bg-muted-foreground/40",
        )}
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p
          className={cn(
            "text-xs capitalize",
            status === "approved" && "text-emerald-600 dark:text-emerald-400",
            status === "draft" && "text-amber-600 dark:text-amber-400",
            status === "missing" && "text-muted-foreground",
          )}
        >
          {status === "missing" ? "Not started" : status}
        </p>
        {detail ? (
          <p className="mt-0.5 text-[11px] text-muted-foreground">{detail}</p>
        ) : null}
      </div>
    </div>
  );
}
