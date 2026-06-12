import type { AiJob } from "@/features/soap/types/ai-job.types";
import type {
  SoapGenerateInput,
  SoapNote,
  SoapNoteCreateInput,
  SoapNoteUpdateInput,
} from "@/features/soap/types/soap.types";
import { apiClient } from "@/lib/api/client";

export async function getSoapNoteByConsultation(
  consultationId: string,
): Promise<SoapNote> {
  const { data } = await apiClient.get<SoapNote>(
    `/soap-notes/by-consultation/${consultationId}`,
  );
  return data;
}

export async function getSoapNote(id: string): Promise<SoapNote> {
  const { data } = await apiClient.get<SoapNote>(`/soap-notes/${id}`);
  return data;
}

export async function generateSoapNote(input: SoapGenerateInput): Promise<AiJob> {
  const { data } = await apiClient.post<AiJob>("/soap-notes/generate", input);
  return data;
}

export async function createSoapNote(
  input: SoapNoteCreateInput,
): Promise<SoapNote> {
  const { data } = await apiClient.post<SoapNote>("/soap-notes", input);
  return data;
}

export async function updateSoapNote(
  id: string,
  input: SoapNoteUpdateInput,
): Promise<SoapNote> {
  const { data } = await apiClient.put<SoapNote>(`/soap-notes/${id}`, input);
  return data;
}

export async function approveSoapNote(id: string): Promise<SoapNote> {
  const { data } = await apiClient.post<SoapNote>(`/soap-notes/${id}/approve`);
  return data;
}
