"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FileText } from "lucide-react";

import { ConsultationHeader } from "@/features/consultations/components/consultation-header";
import { useConsultation } from "@/features/consultations/hooks/use-consultation";
import { usePatient } from "@/features/patients/hooks/use-patient";
import { ApiErrorDisplay } from "@/shared/ui/feedback/api-error";
import { ConsultationDetailSkeleton } from "@/shared/ui/feedback/clinical-skeletons";
import { routes } from "@/shared/constants/routes";
import { Button } from "@/shared/ui/primitives/button";
import { PageContainer } from "@/shared/ui/layout/page-container";

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

  if (isLoading && !consultation) {
    return (
      <PageContainer>
        <ConsultationDetailSkeleton />
      </PageContainer>
    );
  }

  if (isError || !consultation) {
    return (
      <PageContainer>
        <ApiErrorDisplay
          error={(error as Error) ?? new Error("Visit not found")}
          onRetry={() => void refetch()}
          title="Unable to load visit"
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

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="default">
          <Link href={routes.app.consultationSoap(consultation.id)}>
            <FileText className="h-4 w-4" />
            Open note
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={routes.app.consultationPrescription(consultation.id)}>
            <FileText className="h-4 w-4" />
            Open prescription
          </Link>
        </Button>
      </div>

      <section className="rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="text-base font-semibold">Patient summary</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted-foreground">Name</dt>
            <dd className="mt-1 text-sm font-medium">{patient?.full_name ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Phone</dt>
            <dd className="mt-1 text-sm">{patient?.phone ?? "—"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs text-muted-foreground">Chief complaint</dt>
            <dd className="mt-1 text-sm">{consultation.chief_complaint ?? "—"}</dd>
          </div>
        </dl>
      </section>
    </PageContainer>
  );
}
