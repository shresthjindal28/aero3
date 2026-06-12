"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FileText } from "lucide-react";

import { ConsultationHeader } from "@/features/consultations/components/consultation-header";
import { ConsultationStatusBadge } from "@/features/consultations/components/consultation-status-badge";
import { useConsultation } from "@/features/consultations/hooks/use-consultation";
import {
  formatConsultationDate,
  formatDuration,
} from "@/features/consultations/utils/consultation.utils";
import { useDoctorMe } from "@/features/auth/hooks/use-doctor-auth";
import { usePatient } from "@/features/patients/hooks/use-patient";
import { formatDateTime } from "@/lib/utils/date";
import { ApiErrorDisplay } from "@/shared/ui/feedback/api-error";
import { PageLoader } from "@/shared/ui/feedback/page-loader";
import { routes } from "@/shared/constants/routes";
import { Button } from "@/shared/ui/primitives/button";
import { PageContainer } from "@/shared/ui/layout/page-container";

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="text-sm">{value}</p>
    </div>
  );
}

export function ConsultationDetailPage() {
  const params = useParams<{ consultationId: string }>();
  const consultationId = params.consultationId;

  const {
    data: consultation,
    isLoading,
    isError,
    error,
    refetch,
  } = useConsultation(consultationId);
  const { data: patient } = usePatient(consultation?.patient_id ?? "", Boolean(consultation));
  const { data: doctor } = useDoctorMe(Boolean(consultation));

  if (isLoading) {
    return <PageLoader label="Loading consultation..." />;
  }

  if (isError || !consultation) {
    return (
      <PageContainer>
        <ApiErrorDisplay
          error={(error as Error) ?? new Error("Consultation not found")}
          onRetry={() => void refetch()}
          title="Unable to load consultation"
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-6">
      <ConsultationHeader
        consultation={consultation}
        patientName={patient?.full_name ?? "Patient"}
      />

      <div className="flex flex-wrap justify-end gap-2">
        <Button asChild variant="outline">
          <Link href={routes.app.consultationPrescription(consultation.id)}>
            <FileText className="h-4 w-4" />
            Open prescription
          </Link>
        </Button>
        <Button asChild variant="default">
          <Link href={routes.app.consultationSoap(consultation.id)}>
            <FileText className="h-4 w-4" />
            Open SOAP workspace
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <section className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-base font-semibold">Consultation overview</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <InfoItem
              label="Chief complaint"
              value={consultation.chief_complaint ?? "—"}
            />
            <InfoItem label="Status" value={consultation.status} />
            <InfoItem
              label="Duration"
              value={formatDuration(consultation.duration_seconds)}
            />
            <InfoItem
              label="Started"
              value={
                consultation.started_at
                  ? formatDateTime(consultation.started_at)
                  : "Not started"
              }
            />
            <InfoItem
              label="Ended"
              value={
                consultation.ended_at ? formatDateTime(consultation.ended_at) : "Not ended"
              }
            />
            <InfoItem
              label="Created"
              value={formatConsultationDate(consultation.created_at)}
            />
            <InfoItem
              label="Last updated"
              value={formatDateTime(consultation.updated_at)}
            />
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="text-base font-semibold">Patient</h2>
            <div className="mt-4 space-y-3">
              <InfoItem label="Name" value={patient?.full_name ?? "—"} />
              <InfoItem label="Phone" value={patient?.phone ?? "—"} />
              <InfoItem label="Blood group" value={patient?.blood_group ?? "—"} />
            </div>
          </section>

          <section className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="text-base font-semibold">Doctor</h2>
            <div className="mt-4 space-y-3">
              <InfoItem label="Name" value={doctor?.full_name ?? "—"} />
              <InfoItem label="Email" value={doctor?.email ?? "—"} />
              <InfoItem
                label="Specialization"
                value={doctor?.specialization ?? "—"}
              />
            </div>
          </section>

          <section className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-base font-semibold">Status</h2>
            <ConsultationStatusBadge status={consultation.status} />
          </section>
        </div>
      </div>
    </PageContainer>
  );
}
