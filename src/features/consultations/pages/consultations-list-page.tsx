"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { ConsultationTable } from "@/features/consultations/components/consultation-table";
import { EmptyConsultationsState } from "@/features/consultations/components/empty-consultations-state";
import { useConsultations } from "@/features/consultations/hooks/use-consultations";
import {
  CONSULTATION_FILTER_LABELS,
  filterConsultations,
  parseConsultationFilter,
} from "@/features/consultations/utils/consultation-filters";
import { routes } from "@/shared/constants/routes";
import { ApiErrorDisplay } from "@/shared/ui/feedback/api-error";
import { TableRowsSkeleton } from "@/shared/ui/feedback/clinical-skeletons";
import { PageContainer } from "@/shared/ui/layout/page-container";
import { PageHeader } from "@/shared/ui/layout/page-header";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";

const FILTER_OPTIONS = ["active", "waiting", "needs-note", "all"] as const;

export function ConsultationsListPage() {
  const searchParams = useSearchParams();
  const activeFilter = parseConsultationFilter(searchParams.get("filter"));

  const {
    data: consultations = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useConsultations();

  const filteredConsultations = useMemo(() => {
    const filtered = filterConsultations(consultations, activeFilter);
    return [...filtered].sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    );
  }, [consultations, activeFilter]);

  return (
    <PageContainer>
      <PageHeader
        title="Visits"
        description={
          activeFilter === "all"
            ? "Review visit history across your practice."
            : CONSULTATION_FILTER_LABELS[activeFilter]
        }
      />

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTER_OPTIONS.map((filter) => (
          <Link
            key={filter}
            href={routes.app.consultationsWithFilter(filter)}
            className={cn(
              "rounded-full border px-3 py-1 text-sm transition-colors",
              activeFilter === filter
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/60 text-muted-foreground hover:bg-muted/40",
            )}
          >
            {CONSULTATION_FILTER_LABELS[filter]}
          </Link>
        ))}
      </div>

      <div className="mt-8 space-y-4">
        {isError ? (
          <ApiErrorDisplay
            error={(error as Error) ?? new Error("Unable to load visits")}
            onRetry={() => void refetch()}
          />
        ) : isLoading && consultations.length === 0 ? (
          <TableRowsSkeleton rows={6} />
        ) : filteredConsultations.length === 0 ? (
          <EmptyConsultationsState />
        ) : (
          <>
            <ConsultationTable consultations={filteredConsultations} isLoading={isLoading} />
            <p className="text-sm text-muted-foreground md:hidden">
              {filteredConsultations.length} visits
            </p>
          </>
        )}
      </div>
    </PageContainer>
  );
}
