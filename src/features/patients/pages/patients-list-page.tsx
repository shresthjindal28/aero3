"use client";

import Link from "next/link";
import { Plus, Search } from "lucide-react";

import { EmptyPatientsState } from "@/features/patients/components/empty-patients-state";
import { PatientTable } from "@/features/patients/components/patient-table";
import { usePatientsList } from "@/features/patients/hooks/use-patients";
import { routes } from "@/shared/constants/routes";
import { ApiErrorDisplay } from "@/shared/ui/feedback/api-error";
import { PageContainer } from "@/shared/ui/layout/page-container";
import { PageHeader } from "@/shared/ui/layout/page-header";
import { Button } from "@/shared/ui/primitives/button";
import { Input } from "@/shared/ui/primitives/input";

export function PatientsListPage() {
  const {
    patients,
    isLoading,
    isError,
    error,
    refetch,
    search,
    setSearch,
    page,
    setPage,
    totalPages,
    filteredTotal,
    total,
    sortField,
    sortDirection,
    toggleSort,
  } = usePatientsList();

  const hasSearch = search.trim().length > 0;
  const isEmpty = !isLoading && filteredTotal === 0;

  return (
    <PageContainer>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Patients"
          description="Your panel — find patients quickly and start the next visit."
        />
        <Button asChild className="shrink-0">
          <Link href={routes.app.patientsNew}>
            <Plus className="h-4 w-4" />
            Add patient
          </Link>
        </Button>
      </div>

      <div className="mt-8 space-y-4">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search patients..."
            className="pl-9"
          />
        </div>

        {isError ? (
          <ApiErrorDisplay
            error={(error as Error) ?? new Error("Unable to load patients")}
            onRetry={() => void refetch()}
          />
        ) : isEmpty ? (
          <EmptyPatientsState hasSearch={hasSearch} />
        ) : (
          <>
            <PatientTable
              patients={patients}
              isLoading={isLoading}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={toggleSort}
            />

            <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {patients.length} of {filteredTotal} filtered · {total} total
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page <= 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  disabled={page >= totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </PageContainer>
  );
}
