import type {
  MemoryDocument,
  MemoryProfile,
  MemorySearchRequest,
  MemorySearchResponse,
  PatientMemoryContext,
} from "@/features/memory/types/memory.types";
import { apiClient } from "@/lib/api/client";

export async function getMemoryProfile(patientId: string): Promise<MemoryProfile> {
  const { data } = await apiClient.get<MemoryProfile>(
    `/memory/patient/${patientId}/profile`,
  );
  return data;
}

export async function getMemoryDocuments(
  patientId: string,
  params?: { source_type?: string; limit?: number },
): Promise<MemoryDocument[]> {
  const { data } = await apiClient.get<MemoryDocument[]>(
    `/memory/patient/${patientId}/documents`,
    { params },
  );
  return data;
}

export async function getPatientMemoryContext(
  patientId: string,
  params?: { consultation_id?: string; query?: string; top_k?: number },
): Promise<PatientMemoryContext> {
  const { data } = await apiClient.get<PatientMemoryContext>(
    `/memory/patient/${patientId}`,
    { params },
  );
  return data;
}

export async function searchMemory(
  input: MemorySearchRequest,
): Promise<MemorySearchResponse> {
  const { data } = await apiClient.post<MemorySearchResponse>(
    "/memory/search",
    input,
  );
  return data;
}
