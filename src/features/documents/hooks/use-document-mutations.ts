"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createConsultationDocument,
  deleteConsultationDocument,
} from "@/features/documents/api/documents.api";
import { uploadStorageFile } from "@/features/documents/api/storage.api";
import type { ConsultationDocumentCreateInput } from "@/features/documents/types/document.types";
import type { ApiError } from "@/lib/api/types/api-error.types";
import { queryKeys } from "@/shared/constants/query-keys";

export function useUploadDocument(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      consultationId: string;
      file: File;
    }) => {
      const upload = await uploadStorageFile(
        {
          resource_type: "consultation_document",
          consultation_id: input.consultationId,
          file_name: input.file.name,
        },
        input.file,
        input.file.name,
      );

      return createConsultationDocument({
        consultation_id: input.consultationId,
        file_name: input.file.name,
        file_url: upload.object_key,
        file_type: input.file.type || null,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.documents.byPatient(patientId),
      });
      toast.success("Document uploaded");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Upload failed");
    },
  });
}

export function useDeleteDocument(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentId: string) => deleteConsultationDocument(documentId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.documents.byPatient(patientId),
      });
      toast.success("Document deleted");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Delete failed");
    },
  });
}

export function useCreateDocumentMetadata(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ConsultationDocumentCreateInput) =>
      createConsultationDocument(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.documents.byPatient(patientId),
      });
    },
  });
}
