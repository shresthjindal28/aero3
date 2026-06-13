"use client";

import Link from "next/link";
import { ArrowLeft, FileDown, Printer } from "lucide-react";

import { useDoctorMe } from "@/features/auth/hooks/use-doctor-auth";
import { useConsultation } from "@/features/consultations/hooks/use-consultation";
import { usePatient } from "@/features/patients/hooks/use-patient";
import { PrescriptionHtmlEditor } from "@/features/prescription/components/prescription-html-editor";
import { PrescriptionVersionPanel } from "@/features/prescription/components/prescription-version-panel";
import {
  useExportPrescriptionAudit,
  usePrintPrescriptionAudit,
} from "@/features/prescription/hooks/use-prescription-mutations";
import { usePrescription } from "@/features/prescription/hooks/use-prescription";
import { routes } from "@/shared/constants/routes";
import { ExportService } from "@/shared/export/export.service";
import { ApiErrorDisplay } from "@/shared/ui/feedback/api-error";
import { Button } from "@/shared/ui/primitives/button";
import { cn } from "@/lib/utils/cn";
import { formatChiefComplaint } from "@/lib/utils/format";
import { formatDateTime } from "@/lib/utils/date";
import { Loader2 } from "lucide-react";

type PrescriptionDetailPageProps = {
  prescriptionId: string;
};

export function PrescriptionDetailPage({ prescriptionId }: PrescriptionDetailPageProps) {
  const { data: prescription, isLoading, error } = usePrescription(prescriptionId);
  const { data: consultation } = useConsultation(
    prescription?.consultation_id ?? "",
    Boolean(prescription?.consultation_id),
  );
  const { data: patient } = usePatient(
    prescription?.patient_id ?? "",
    Boolean(prescription?.patient_id),
  );
  const { data: doctor } = useDoctorMe(Boolean(prescription));

  const exportAudit = useExportPrescriptionAudit(prescription?.consultation_id ?? "");
  const printAudit = usePrintPrescriptionAudit(prescription?.consultation_id ?? "");

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading prescription record…</p>
        </div>
      </div>
    );
  }

  if (error || !prescription) {
    return (
      <div className="flex h-full w-full items-center justify-center p-6">
        <ApiErrorDisplay
          error={(error as Error) ?? new Error("Prescription not found")}
        />
      </div>
    );
  }

  const consultationLabel = formatChiefComplaint(consultation?.chief_complaint);

  const handleExport = async () => {
    if (!patient || !doctor) return;
    await exportAudit.mutateAsync(prescription.id);
    void ExportService.exportPrescriptionPdf({
      htmlContent: prescription.html_content,
      patientName: patient.full_name,
      doctorName: doctor.full_name,
      doctorRegistration: doctor.qualification ?? "",
      hospitalName: doctor.hospital_name ?? "AIRO Clinical",
      consultationLabel,
    });
  };

  const handlePrint = async () => {
    if (!patient || !doctor) return;
    await printAudit.mutateAsync(prescription.id);
    void ExportService.exportPrescriptionPdf({
      htmlContent: prescription.html_content,
      patientName: patient.full_name,
      doctorName: doctor.full_name,
      doctorRegistration: doctor.qualification ?? "",
      hospitalName: doctor.hospital_name ?? "AIRO Clinical",
      consultationLabel,
      autoPrint: true,
    });
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background">
      <header className="shrink-0 border-b bg-background">
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 lg:px-6">
          <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" asChild>
            <Link href={routes.app.patientPrescriptions(prescription.patient_id)}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="shrink-0 rounded bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                Record
              </span>
              <h1 className="truncate text-base font-semibold sm:text-lg">
                Prescription record
              </h1>
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                  prescription.is_approved
                    ? "bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20 dark:text-emerald-300"
                    : "bg-muted text-muted-foreground ring-1 ring-border",
                )}
              >
                {prescription.is_approved ? "Approved" : "Draft"}
              </span>
              <span className="rounded-full border border-border/60 px-2.5 py-0.5 text-[11px] font-medium">
                v{prescription.version_number}
              </span>
            </div>
            <p className="truncate text-xs text-muted-foreground sm:text-sm">
              {patient?.full_name ?? "Patient"}
              {consultationLabel ? ` · ${consultationLabel}` : ""}
              {" · "}
              {formatDateTime(prescription.created_at)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => void handlePrint()}>
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" size="sm" onClick={() => void handleExport()}>
              <FileDown className="h-4 w-4" />
              Export PDF
            </Button>
            {prescription.is_current ? (
              <Button size="sm" asChild>
                <Link
                  href={routes.app.consultationPrescription(prescription.consultation_id)}
                >
                  Open in workspace
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-72 shrink-0 flex-col border-r bg-muted/15 lg:flex xl:w-80">
          <div className="border-b px-4 py-3">
            <h2 className="text-sm font-semibold">Version history</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Clinical revisions preserved for audit
            </p>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <PrescriptionVersionPanel
              prescriptionId={prescription.id}
              activeVersionId={prescription.id}
              className="border-0 bg-transparent p-0 shadow-none"
            />
          </div>
        </aside>

        <section className="flex min-h-0 min-w-0 flex-1 flex-col">
          <PrescriptionHtmlEditor
            value={prescription.html_content}
            version={prescription.version_number}
            readOnly
            onChange={() => undefined}
          />
        </section>
      </div>
    </div>
  );
}
