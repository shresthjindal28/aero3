import type {
  ConsultationDocument,
  ConsultationDocumentCreateInput,
} from "@/features/documents/types/document.types";
import { apiClient } from "@/lib/api/client";

export async function listConsultationDocuments(
  consultationId: string,
): Promise<ConsultationDocument[]> {
  const { data } = await apiClient.get<ConsultationDocument[]>(
    `/consultation-documents/by-consultation/${consultationId}`,
  );
  return data;
}

export async function getConsultationDocument(
  documentId: string,
): Promise<ConsultationDocument> {
  const { data } = await apiClient.get<ConsultationDocument>(
    `/consultation-documents/${documentId}`,
  );
  return data;
}

export async function createConsultationDocument(
  input: ConsultationDocumentCreateInput,
): Promise<ConsultationDocument> {
  const { data } = await apiClient.post<ConsultationDocument>(
    "/consultation-documents",
    input,
  );
  return data;
}

export async function deleteConsultationDocument(
  documentId: string,
): Promise<void> {
  await apiClient.delete(`/consultation-documents/${documentId}`);
}
