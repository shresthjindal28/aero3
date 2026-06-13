"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchSystemSnapshot } from "@/features/admin/api/system-monitoring.api";
import { listDoctors, listPendingDoctors } from "@/features/admin/api/doctors-admin.api";
import { queryKeys } from "@/shared/constants/query-keys";

export function useAdminDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard.admin,
    queryFn: async () => {
      const [doctors, pending, system] = await Promise.all([
        listDoctors(),
        listPendingDoctors(),
        fetchSystemSnapshot().catch(() => null),
      ]);

      const workerStatus =
        system?.health.worker === "healthy"
          ? ("healthy" as const)
          : system?.health.worker === "unknown"
            ? ("unknown" as const)
            : ("unhealthy" as const);

      return {
        doctorsCount: doctors.length,
        pendingVerifications: pending.length,
        activeDoctors: doctors.filter((d) => d.is_active).length,
        approvedDoctors: doctors.filter((d) => d.verification_status === "approved")
          .length,
        aiJobsCount: system?.queue.pending ?? 0,
        workerHealth: workerStatus,
      };
    },
  });
}
