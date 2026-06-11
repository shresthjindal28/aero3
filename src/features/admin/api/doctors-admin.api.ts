import type { DoctorProfile } from "@/features/auth/types/actor.types";
import { apiClient } from "@/lib/api/client";

export async function listDoctors(): Promise<DoctorProfile[]> {
  const { data } = await apiClient.get<DoctorProfile[]>("/admins/doctors");
  return data;
}

export async function listPendingDoctors(): Promise<DoctorProfile[]> {
  try {
    const { data } = await apiClient.get<DoctorProfile[] | { message: string }>(
      "/admins/doctors/pending-verification",
    );
    if (Array.isArray(data)) return data;
    const all = await listDoctors();
    return all.filter((d) => d.verification_status === "pending");
  } catch {
    const all = await listDoctors();
    return all.filter((d) => d.verification_status === "pending");
  }
}

export async function approveDoctor(doctorId: string): Promise<unknown> {
  const { data } = await apiClient.post(`/admins/doctors/${doctorId}/approve`);
  return data;
}

export async function rejectDoctor(doctorId: string): Promise<unknown> {
  const { data } = await apiClient.post(`/admins/doctors/${doctorId}/reject`);
  return data;
}
