"use client";

import { useParams } from "next/navigation";

import { PatientWorkspace } from "@/features/patients/components/patient-workspace";
import { usePatient } from "@/features/patients/hooks/use-patient";
import { useCacheWarm } from "@/features/voice-agent/hooks/use-cache-warm";
import { ApiErrorDisplay } from "@/shared/ui/feedback/api-error";
import { PatientDetailSkeleton } from "@/shared/ui/feedback/clinical-skeletons";
import { PageContainer } from "@/shared/ui/layout/page-container";

export function PatientDetailPage() {
  const params = useParams<{ patientId: string }>();
  const patientId = params.patientId;
  const { data: patient, isLoading, isError, error, refetch } = usePatient(patientId);
  useCacheWarm(patientId, Boolean(patientId));

  if (isLoading && !patient) {
    return (
      <PageContainer>
        <PatientDetailSkeleton />
      </PageContainer>
    );
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
