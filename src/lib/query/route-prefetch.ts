import type { QueryClient } from "@tanstack/react-query";

import { consultationQueries } from "@/features/consultations/queries/consultation-queries";
import { patientQueries } from "@/features/patients/queries/patient-queries";
import { routes } from "@/shared/constants/routes";

export function prefetchDoctorWorkspaceData(queryClient: QueryClient) {
  void queryClient.prefetchQuery(patientQueries.list());
  void queryClient.prefetchQuery(consultationQueries.list());
}

const DOCTOR_ROUTE_PREFETCH: Record<string, (qc: QueryClient) => void> = {
  [routes.app.dashboard]: prefetchDoctorWorkspaceData,
  [routes.app.patients]: (qc) => void qc.prefetchQuery(patientQueries.list()),
  [routes.app.consultations]: (qc) =>
    void qc.prefetchQuery(consultationQueries.list()),
};

export function prefetchDoctorRoute(queryClient: QueryClient, href: string) {
  const prefetch = DOCTOR_ROUTE_PREFETCH[href];
  if (prefetch) {
    prefetch(queryClient);
  }
}
