import type { DoctorProfile } from "@/features/auth/types/actor.types";
import { apiClient } from "@/lib/api/client";

export async function listDoctors(): Promise<DoctorProfile[]> {
  const { data } = await apiClient.get<DoctorProfile[]>("/admins/doctors");
  return data;
}

export async function listPendingDoctors(): Promise<{ message: string }> {
  const { data } = await apiClient.get<{ message: string }>(
    "/admins/doctors/pending-verification",
  );
  return data;
}
