"use client";

import { DoctorsTable } from "@/features/admin/components/doctors-table";
import {
  useAdminDoctors,
  useDoctorVerificationActions,
} from "@/features/admin/hooks/use-admin-doctors";
import { PageLoader } from "@/shared/ui/feedback/page-loader";
import { PageContainer } from "@/shared/ui/layout/page-container";
import { PageHeader } from "@/shared/ui/layout/page-header";

export function DoctorsPage() {
  const { data: doctors = [], isLoading } = useAdminDoctors();
  const actions = useDoctorVerificationActions();

  if (isLoading) return <PageLoader label="Loading doctors..." />;

  return (
    <PageContainer>
      <PageHeader title="Doctors" description="Manage registered doctors" />
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
