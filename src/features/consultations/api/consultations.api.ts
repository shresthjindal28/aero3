import type {
  Consultation,
  ConsultationCreateInput,
  ConsultationUpdateInput,
} from "@/features/consultations/types/consultation.types";
import { apiClient } from "@/lib/api/client";

export async function listConsultations(patientId?: string): Promise<Consultation[]> {
  const { data } = await apiClient.get<Consultation[]>("/consultations", {
    params: patientId ? { patient_id: patientId } : undefined,
  });
  return data;
}

export async function getConsultation(id: string): Promise<Consultation> {
  const { data } = await apiClient.get<Consultation>(`/consultations/${id}`);
  return data;
}

export async function createConsultation(
  payload: ConsultationCreateInput,
): Promise<Consultation> {
  const { data } = await apiClient.post<Consultation>("/consultations", payload);
  return data;
}

export async function updateConsultation(
  id: string,
  payload: ConsultationUpdateInput,
): Promise<Consultation> {
  const { data } = await apiClient.patch<Consultation>(`/consultations/${id}`, payload);
  return data;
}

export async function deleteConsultation(id: string): Promise<{ message: string }> {
  const { data } = await apiClient.delete<{ message: string }>(`/consultations/${id}`);
  return data;
}
