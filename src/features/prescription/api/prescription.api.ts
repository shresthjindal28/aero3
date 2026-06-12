import type { AiJob } from "@/features/soap/types/ai-job.types";
import type {
  Prescription,
  PrescriptionUpdateInput,
} from "@/features/prescription/types/prescription.types";
import { apiClient } from "@/lib/api/client";

export async function getPrescriptionByConsultation(
  consultationId: string,
): Promise<Prescription> {
  const { data } = await apiClient.get<Prescription>(
    `/prescriptions/by-consultation/${consultationId}`,
  );
  return data;
}

export async function generatePrescription(
  consultationId: string,
  regenerate = false,
): Promise<AiJob> {
  const { data } = await apiClient.post<AiJob>(
    `/prescriptions/generate/${consultationId}`,
    undefined,
    { params: { regenerate } },
  );
  return data;
}

export async function updatePrescription(
  id: string,
  input: PrescriptionUpdateInput,
): Promise<Prescription> {
  const { data } = await apiClient.put<Prescription>(
    `/prescriptions/${id}`,
    input,
  );
  return data;
}

export async function approvePrescription(id: string): Promise<Prescription> {
  const { data } = await apiClient.post<Prescription>(
    `/prescriptions/${id}/approve`,
  );
  return data;
}

export async function exportPrescription(id: string): Promise<Prescription> {
  const { data } = await apiClient.post<Prescription>(
    `/prescriptions/${id}/export`,
  );
  return data;
}

export async function deletePrescription(id: string): Promise<void> {
  await apiClient.delete(`/prescriptions/${id}`);
}
