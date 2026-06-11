"use client";

import { useQuery } from "@tanstack/react-query";

import { listDoctors, listPendingDoctors } from "@/features/admin/api/doctors-admin.api";
import { queryKeys } from "@/shared/constants/query-keys";

export function useAdminDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard.admin,
    queryFn: async () => {
      const [doctors, pending] = await Promise.all([
        listDoctors(),
        listPendingDoctors(),
      ]);

      return {
        doctorsCount: doctors.length,
        pendingVerifications: pending.length,
        activeDoctors: doctors.filter((d) => d.is_active).length,
        approvedDoctors: doctors.filter((d) => d.verification_status === "approved")
          .length,
        aiJobsCount: 0,
        workerHealth: "healthy" as const,
      };
    },
  });
}
