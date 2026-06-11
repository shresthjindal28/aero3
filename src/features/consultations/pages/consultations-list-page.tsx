"use client";

import { useMemo } from "react";

import { ConsultationTable } from "@/features/consultations/components/consultation-table";
import { EmptyConsultationsState } from "@/features/consultations/components/empty-consultations-state";
import { useConsultations } from "@/features/consultations/hooks/use-consultations";
import { ApiErrorDisplay } from "@/shared/ui/feedback/api-error";
import { PageContainer } from "@/shared/ui/layout/page-container";
import { PageHeader } from "@/shared/ui/layout/page-header";

export function ConsultationsListPage() {
  const {
    data: consultations = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useConsultations();

  const sortedConsultations = useMemo(
    () =>
      [...consultations].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      ),
    [consultations],
  );

  return (
    <PageContainer>
      <PageHeader
        title="Consultations"
        description="Review consultation history across your practice."
      />

      <div className="mt-8 space-y-4">
        {isError ? (
          <ApiErrorDisplay
            error={(error as Error) ?? new Error("Unable to load consultations")}
            onRetry={() => void refetch()}
          />
        ) : sortedConsultations.length === 0 && !isLoading ? (
          <EmptyConsultationsState />
        ) : (
          <>
            <ConsultationTable
              consultations={sortedConsultations}
              isLoading={isLoading}
            />
            <p className="text-sm text-muted-foreground md:hidden">
              {sortedConsultations.length} consultations across{" "}
              {new Set(sortedConsultations.map((item) => item.patient_id)).size} patients
            </p>
          </>
        )}
      </div>
    </PageContainer>
  );
}
