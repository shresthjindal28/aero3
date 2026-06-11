"use client";

import { useQuery } from "@tanstack/react-query";

import { getDoctorDetail } from "@/features/admin/api/doctors-admin.api";
import {
  useDoctorVerificationActions,
} from "@/features/admin/hooks/use-admin-doctors";
import { ApiErrorDisplay } from "@/shared/ui/feedback/api-error";
import { PageLoader } from "@/shared/ui/feedback/page-loader";
import { PageContainer } from "@/shared/ui/layout/page-container";
import { PageHeader } from "@/shared/ui/layout/page-header";
import { Button } from "@/shared/ui/primitives/button";

type DoctorDetailPageProps = {
  doctorId: string;
};

export function DoctorDetailPage({ doctorId }: DoctorDetailPageProps) {
  const actions = useDoctorVerificationActions();
  const { data: doctor, isLoading, error } = useQuery({
    queryKey: ["admin", "doctor", doctorId],
    queryFn: () => getDoctorDetail(doctorId),
  });

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

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
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
            <span className="text-muted-foreground">Location:</span>{" "}
            {[doctor.city, doctor.state, doctor.country].filter(Boolean).join(", ") || "—"}
          </p>
          <p className="mt-2">
            <span className="text-muted-foreground">Phone:</span> {doctor.phone ?? "—"}
          </p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/50 p-4 text-sm">
          <p className="font-medium">Medical registration</p>
          <p className="mt-2">
            <span className="text-muted-foreground">Number:</span>{" "}
            {doctor.verification?.registration_number ?? "—"}
          </p>
          <p className="mt-2">
            <span className="text-muted-foreground">Council:</span>{" "}
            {doctor.verification?.medical_council ?? "—"}
          </p>
          {doctor.verification?.verification_notes ? (
            <p className="mt-2">
              <span className="text-muted-foreground">Notes:</span>{" "}
              {doctor.verification.verification_notes}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-border/60 bg-card/50 p-4">
        <p className="font-medium">Uploaded documents</p>
        {doctor.documents.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No documents uploaded.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {doctor.documents.map((document) => (
              <li key={document.id} className="flex justify-between gap-4">
                <span className="capitalize">
                  {document.document_type.replaceAll("_", " ")}
                </span>
                <span className="text-muted-foreground">{document.file_name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {doctor.verification_status === "pending" ? (
        <div className="mt-6 flex gap-3">
          <Button
            type="button"
            onClick={() => actions.approve.mutate(doctor.id)}
            disabled={actions.isPending}
          >
            Approve doctor
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => actions.reject.mutate(doctor.id)}
            disabled={actions.isPending}
          >
            Reject
          </Button>
        </div>
      ) : null}
    </PageContainer>
  );
}
