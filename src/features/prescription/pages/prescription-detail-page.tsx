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
import { PageLoader } from "@/shared/ui/feedback/page-loader";
import { Button } from "@/shared/ui/primitives/button";
import { cn } from "@/lib/utils/cn";
import { formatDateTime } from "@/lib/utils/date";

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
    return <PageLoader label="Loading prescription record…" />;
  }

  if (error || !prescription) {
    return (
      <div className="p-6">
        <ApiErrorDisplay
          error={(error as Error) ?? new Error("Prescription not found")}
        />
      </div>
    );
  }

  const consultationLabel = consultation?.chief_complaint ?? "Consultation";

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
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Button variant="ghost" size="sm" asChild className="-ml-2">
            <Link href={routes.app.patientPrescriptions(prescription.patient_id)}>
              <ArrowLeft className="h-4 w-4" />
              Prescription history
            </Link>
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Prescription record
            </h1>
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-medium",
                prescription.is_approved
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {prescription.is_approved ? "Approved" : "Draft"}
            </span>
            <span className="rounded-full border border-border/60 px-2.5 py-1 text-xs font-medium">
              v{prescription.version_number}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {patient?.full_name ?? "Patient"} · {formatDateTime(prescription.created_at)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => void handlePrint()}>
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" onClick={() => void handleExport()}>
            <FileDown className="h-4 w-4" />
            Export PDF
          </Button>
          {prescription.is_current ? (
            <Button asChild>
              <Link
                href={routes.app.consultationPrescription(prescription.consultation_id)}
              >
                Open in workspace
              </Link>
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <PrescriptionVersionPanel
          prescriptionId={prescription.id}
          activeVersionId={prescription.id}
        />

        <div className="min-h-[70vh] overflow-hidden rounded-xl border border-border/60">
          <PrescriptionHtmlEditor
            value={prescription.html_content}
            version={prescription.version_number}
            readOnly
            onChange={() => undefined}
          />
        </div>
      </div>
    </div>
  );
}
