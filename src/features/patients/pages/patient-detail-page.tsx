"use client";

import { useParams } from "next/navigation";

import { PatientWorkspace } from "@/features/patients/components/patient-workspace";
import { usePatient } from "@/features/patients/hooks/use-patient";
import { ApiErrorDisplay } from "@/shared/ui/feedback/api-error";
import { PageLoader } from "@/shared/ui/feedback/page-loader";
import { PageContainer } from "@/shared/ui/layout/page-container";

export function PatientDetailPage() {
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
          title="Unable to load patient"
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PatientWorkspace patient={patient} />
    </PageContainer>
  );
}
