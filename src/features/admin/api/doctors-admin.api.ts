import type { DoctorProfile } from "@/features/auth/types/actor.types";
import type { DoctorAdminDetail } from "@/features/onboarding/types/onboarding.types";
import { apiClient } from "@/lib/api/client";

export async function listDoctors(): Promise<DoctorProfile[]> {
  const { data } = await apiClient.get<DoctorProfile[]>("/admins/doctors");
  return data;
}

export async function listPendingDoctors(): Promise<DoctorProfile[]> {
  const { data } = await apiClient.get<DoctorProfile[]>(
    "/admins/doctors/pending-verification",
  );
  return data;
}

export async function getDoctorDetail(doctorId: string): Promise<DoctorAdminDetail> {
  const { data } = await apiClient.get<DoctorAdminDetail>(`/admins/doctors/${doctorId}`);
  return data;
}

export async function approveDoctor(
  doctorId: string,
  verificationNotes?: string,
): Promise<unknown> {
  const { data } = await apiClient.post(`/admins/doctors/${doctorId}/approve`, {
    verification_notes: verificationNotes,
  });
  return data;
}

export async function rejectDoctor(
  doctorId: string,
  verificationNotes?: string,
): Promise<unknown> {
  const { data } = await apiClient.post(`/admins/doctors/${doctorId}/reject`, {
    verification_notes: verificationNotes,
  });
  return data;
}
