"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

import { consultationQueries } from "@/features/consultations/queries/consultation-queries";
import type { Consultation } from "@/features/consultations/types/consultation.types";
import { patientQueries } from "@/features/patients/queries/patient-queries";
import type { Patient } from "@/features/patients/types/patient.types";

function isToday(isoDate: string): boolean {
  const date = new Date(isoDate);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function buildDashboardView(patients: Patient[], consultations: Consultation[]) {
  const activeConsultations = consultations.filter((c) => c.status === "active");
  const waitingConsultations = consultations.filter((c) => c.status === "scheduled");
  const completedToday = consultations.filter(
    (c) => c.status === "completed" && isToday(c.updated_at),
  );
  const pendingNotes = consultations.filter((c) =>
    ["active", "completed"].includes(c.status),
  );

  const patientById = new Map(patients.map((p) => [p.id, p]));

  const recentConsultations = [...consultations]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 6);

  const recentPatients = [...patients]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const actionQueue = [...activeConsultations, ...waitingConsultations]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5)
    .map((consultation) => ({
      consultation,
      patientName: patientById.get(consultation.patient_id)?.full_name ?? "Patient",
    }));

  return {
    activeConsultations: activeConsultations.length,
    waitingPatients: waitingConsultations.length,
    completedToday: completedToday.length,
    pendingNotes: pendingNotes.length,
    totalPatients: patients.length,
    recentConsultations,
    recentPatients,
    actionQueue,
    primaryActive: activeConsultations[0] ?? null,
    primaryActivePatient: activeConsultations[0]
      ? (patientById.get(activeConsultations[0].patient_id) ?? null)
      : null,
  };
}

export function useDoctorDashboard() {
  const queryClient = useQueryClient();

  const patientsQuery = useQuery({
    ...patientQueries.list(),
    placeholderData: () =>
      queryClient.getQueryData<Patient[]>(patientQueries.list().queryKey),
  });

  const consultationsQuery = useQuery({
    ...consultationQueries.list(),
    placeholderData: () =>
      queryClient.getQueryData<Consultation[]>(consultationQueries.list().queryKey),
  });

  const data = useMemo(() => {
    if (!patientsQuery.data || !consultationsQuery.data) return null;
    return buildDashboardView(patientsQuery.data, consultationsQuery.data);
  }, [patientsQuery.data, consultationsQuery.data]);

  return {
    data,
    isLoading: patientsQuery.isLoading || consultationsQuery.isLoading,
    isFetching: patientsQuery.isFetching || consultationsQuery.isFetching,
    isError: patientsQuery.isError || consultationsQuery.isError,
    error: patientsQuery.error ?? consultationsQuery.error,
    refetch: () => {
      void patientsQuery.refetch();
      void consultationsQuery.refetch();
    },
  };
}
