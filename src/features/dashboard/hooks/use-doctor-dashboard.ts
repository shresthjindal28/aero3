"use client";

import { useQuery } from "@tanstack/react-query";

import { listConsultations } from "@/features/consultations/api/consultations.api";
import { listPatients } from "@/features/patients/api/patients.api";
import { queryKeys } from "@/shared/constants/query-keys";

export function useDoctorDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard.doctor,
    queryFn: async () => {
      const [patients, consultations] = await Promise.all([
        listPatients(),
        listConsultations(),
      ]);

      const recentConsultations = [...consultations]
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        .slice(0, 5);

      return {
        patientsCount: patients.length,
        consultationsCount: consultations.length,
        sessionsCount: consultations.filter((c) => c.status === "active").length,
        transcriptCount: consultations.filter((c) => c.status === "completed").length,
        soapCount: consultations.filter((c) =>
          ["completed", "active"].includes(c.status),
        ).length,
        memoryCount: patients.length,
        recentConsultations,
      };
    },
  });
}
