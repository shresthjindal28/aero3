"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

import { useDoctorMe } from "@/features/auth/hooks/use-doctor-auth";
import { usePatient } from "@/features/patients/hooks/use-patient";
import { exportPrescription } from "@/features/prescription/api/prescription.api";
import { PrescriptionHistoryTable } from "@/features/prescription/components/prescription-history-table";
import { usePatientPrescriptions } from "@/features/prescription/hooks/use-patient-prescriptions";
import type { PrescriptionListItem } from "@/features/prescription/types/prescription.types";
import { routes } from "@/shared/constants/routes";
import { ExportService } from "@/shared/export/export.service";
import { ApiErrorDisplay } from "@/shared/ui/feedback/api-error";
import { PageLoader } from "@/shared/ui/feedback/page-loader";
import { Button } from "@/shared/ui/primitives/button";
import { Input } from "@/shared/ui/primitives/input";

type PatientPrescriptionsPageProps = {
  patientId: string;
};

export function PatientPrescriptionsPage({ patientId }: PatientPrescriptionsPageProps) {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");

  const { data: patient, isLoading: patientLoading, error: patientError } =
    usePatient(patientId);
  const { data: doctor } = useDoctorMe(Boolean(patient));
  const {
    data: prescriptions = [],
    isLoading: prescriptionsLoading,
    error: prescriptionsError,
  } = usePatientPrescriptions(patientId, query);

  if (patientLoading) {
    return <PageLoader label="Loading patient…" />;
  }

  if (patientError || !patient) {
    return (
      <div className="p-6">
        <ApiErrorDisplay
          error={(patientError as Error) ?? new Error("Patient not found")}
        />
      </div>
    );
  }

  const handleDownload = async (item: PrescriptionListItem) => {
    if (!doctor) return;
    const prescription = await exportPrescription(item.id);
    void ExportService.exportPrescriptionPdf({
      htmlContent: prescription.html_content,
      patientName: patient.full_name,
      doctorName: doctor.full_name,
      doctorRegistration: doctor.qualification ?? "",
      hospitalName: doctor.hospital_name ?? "AIRO Clinical",
      consultationLabel: item.chief_complaint ?? "Consultation",
    });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href={routes.app.patientDetail(patientId)}>
            <ArrowLeft className="h-4 w-4" />
            {patient.full_name}
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">Prescription history</h1>
        <p className="text-sm text-muted-foreground">
          Permanent clinical records for this patient. Approved prescriptions feed
          patient memory for future consultations.
        </p>
      </div>

      <form
        className="flex max-w-md gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          setQuery(search.trim());
        }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search medications, diagnosis…"
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      {prescriptionsError ? (
        <ApiErrorDisplay error={prescriptionsError as Error} />
      ) : (
        <PrescriptionHistoryTable
          prescriptions={prescriptions}
          isLoading={prescriptionsLoading}
          onDownload={(item) => void handleDownload(item)}
        />
      )}
    </div>
  );
}
