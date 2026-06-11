"use client";

import { useQuery } from "@tanstack/react-query";

import { listDoctors } from "@/features/admin/api/doctors-admin.api";
import { adminQueries } from "@/features/admin/api/admin-queries";
import { ApiErrorDisplay } from "@/shared/ui/feedback/api-error";
import { PageLoader } from "@/shared/ui/feedback/page-loader";
import { PageContainer } from "@/shared/ui/layout/page-container";
import { PageHeader } from "@/shared/ui/layout/page-header";

type DoctorDetailPageProps = {
  doctorId: string;
};

export function DoctorDetailPage({ doctorId }: DoctorDetailPageProps) {
  const { data: doctors = [], isLoading, error } = useQuery({
    ...adminQueries.doctors(),
    queryFn: listDoctors,
  });

  const doctor = doctors.find((d) => d.id === doctorId);

  if (isLoading) return <PageLoader label="Loading doctor..." />;

  if (error || !doctor) {
    return (
      <PageContainer>
        <ApiErrorDisplay error={new Error("Doctor not found")} />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={doctor.full_name}
        description={`${doctor.email} · ${doctor.specialization ?? "No specialization"}`}
      />
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border/60 bg-card/50 p-4 text-sm">
          <p>
            <span className="text-muted-foreground">Verification:</span>{" "}
            <span className="capitalize">{doctor.verification_status}</span>
          </p>
          <p className="mt-2">
            <span className="text-muted-foreground">Hospital:</span>{" "}
            {doctor.hospital_name ?? "—"}
          </p>
          <p className="mt-2">
            <span className="text-muted-foreground">Active:</span>{" "}
            {doctor.is_active ? "Yes" : "No"}
          </p>
        </div>
      </div>
      <p className="mt-6 text-sm text-muted-foreground">
        Doctor document review will be available when doctor document APIs ship.
      </p>
    </PageContainer>
  );
}
