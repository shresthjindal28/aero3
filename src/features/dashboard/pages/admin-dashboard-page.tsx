"use client";

import Link from "next/link";

import { useAdminDashboard } from "@/features/dashboard/hooks/use-admin-dashboard";
import { routes } from "@/shared/constants/routes";
import { PageLoader } from "@/shared/ui/feedback/page-loader";
import { PageContainer } from "@/shared/ui/layout/page-container";
import { PageHeader } from "@/shared/ui/layout/page-header";
import { Button } from "@/shared/ui/primitives/button";

export function AdminDashboardPage() {
  const { data, isLoading } = useAdminDashboard();

  if (isLoading || !data) {
    return <PageLoader label="Loading admin dashboard..." />;
  }

  const metrics = [
    { label: "Doctors", value: data.doctorsCount },
    { label: "Pending verifications", value: data.pendingVerifications },
    { label: "Active doctors", value: data.activeDoctors },
    { label: "Approved doctors", value: data.approvedDoctors },
    { label: "AI jobs", value: data.aiJobsCount },
    { label: "Worker health", value: data.workerHealth },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Admin dashboard"
        description="Platform monitoring and operations"
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-xl border border-border/60 bg-card/50 p-5"
          >
            <p className="text-sm text-muted-foreground">{metric.label}</p>
            <p className="mt-2 text-3xl font-semibold capitalize tabular-nums">
              {metric.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button type="button" asChild>
          <Link href={routes.admin.verification}>Review verifications</Link>
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href={routes.admin.doctors}>Manage doctors</Link>
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href={routes.admin.systemHealth}>System health</Link>
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href={routes.admin.aiJobs}>AI jobs</Link>
        </Button>
      </div>
    </PageContainer>
  );
}
