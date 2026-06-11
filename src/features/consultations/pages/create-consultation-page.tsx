"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { CreateConsultationForm } from "@/features/consultations/components/create-consultation-form";
import { usePatient } from "@/features/patients/hooks/use-patient";
import { routes } from "@/shared/constants/routes";
import { ApiErrorDisplay } from "@/shared/ui/feedback/api-error";
import { PageLoader } from "@/shared/ui/feedback/page-loader";
import { PageContainer } from "@/shared/ui/layout/page-container";
import { PageHeader } from "@/shared/ui/layout/page-header";
import { Button } from "@/shared/ui/primitives/button";

export function CreateConsultationPage() {
  const router = useRouter();
  const params = useParams<{ patientId: string }>();
  const patientId = params.patientId;
  const { data: patient, isLoading, isError, error, refetch } = usePatient(patientId);

  if (isLoading) {
    return <PageLoader label="Loading patient..." />;
  }

  if (isError || !patient) {
    return (
      <PageContainer>
        <ApiErrorDisplay
          error={(error as Error) ?? new Error("Patient not found")}
          onRetry={() => void refetch()}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="max-w-2xl">
      <PageHeader
        title="Start new consultation"
        description={`Create a consultation for ${patient.full_name}.`}
      />
      <div className="mt-8 rounded-xl border bg-card p-6 shadow-sm">
        <CreateConsultationForm
          patientId={patientId}
          onCancel={() => router.push(routes.app.patientDetail(patientId))}
        />
      </div>
      <div className="mt-4">
        <Button asChild variant="ghost" size="sm">
          <Link href={routes.app.patientDetail(patientId)}>Back to patient workspace</Link>
        </Button>
      </div>
    </PageContainer>
  );
}
