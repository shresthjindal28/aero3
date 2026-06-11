import type {
  Patient,
  PatientCreateInput,
  PatientUpdateInput,
} from "@/features/patients/types/patient.types";
import { apiClient } from "@/lib/api/client";

export async function listPatients(): Promise<Patient[]> {
  const { data } = await apiClient.get<Patient[]>("/patients");
  return data;
}

export async function getPatient(id: string): Promise<Patient> {
  const { data } = await apiClient.get<Patient>(`/patients/${id}`);
  return data;
}

export async function createPatient(payload: PatientCreateInput): Promise<Patient> {
  const { data } = await apiClient.post<Patient>("/patients", payload);
  return data;
}

export async function updatePatient(
  id: string,
  payload: PatientUpdateInput,
): Promise<Patient> {
  const { data } = await apiClient.put<Patient>(`/patients/${id}`, payload);
  return data;
}

export async function deletePatient(id: string): Promise<{ message: string }> {
  const { data } = await apiClient.delete<{ message: string }>(`/patients/${id}`);
  return data;
}
