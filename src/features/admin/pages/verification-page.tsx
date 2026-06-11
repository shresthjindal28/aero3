"use client";

import { DoctorsTable } from "@/features/admin/components/doctors-table";
import {
  useDoctorVerificationActions,
  usePendingDoctors,
} from "@/features/admin/hooks/use-admin-doctors";
import { PageLoader } from "@/shared/ui/feedback/page-loader";
import { PageContainer } from "@/shared/ui/layout/page-container";
import { PageHeader } from "@/shared/ui/layout/page-header";

export function VerificationPage() {
  const { data: doctors = [], isLoading } = usePendingDoctors();
  const actions = useDoctorVerificationActions();

  if (isLoading) return <PageLoader label="Loading pending verifications..." />;

  return (
    <PageContainer>
      <PageHeader
        title="Doctor verification"
        description="Review and approve doctor registrations"
      />
      <div className="mt-6">
        <DoctorsTable
          doctors={doctors}
          onApprove={(id) => actions.approve.mutate(id)}
          onReject={(id) => actions.reject.mutate(id)}
          isActionPending={actions.isPending}
        />
      </div>
    </PageContainer>
  );
}
