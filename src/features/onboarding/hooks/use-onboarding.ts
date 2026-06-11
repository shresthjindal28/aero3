"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { persistDoctorAccessState } from "@/features/auth/utils/token-storage";
import {
  createDoctorDocument,
  deleteDoctorDocument,
  getOnboardingStatus,
  listDoctorDocuments,
  submitDoctorVerification,
  updateDoctorProfile,
} from "@/features/onboarding/api/onboarding.api";
import type {
  DoctorDocumentCreateInput,
  DoctorProfileUpdateInput,
  DoctorVerificationSubmitInput,
} from "@/features/onboarding/types/onboarding.types";
import { uploadStorageFile } from "@/features/documents/api/storage.api";
import type { ApiError } from "@/lib/api/types/api-error.types";
import { queryKeys } from "@/shared/constants/query-keys";

export function useOnboardingStatus(enabled = true) {
  return useQuery({
    queryKey: queryKeys.doctor.onboarding,
    queryFn: getOnboardingStatus,
    enabled,
  });
}

export function useDoctorDocuments(enabled = true) {
  return useQuery({
    queryKey: queryKeys.doctor.documents,
    queryFn: listDoctorDocuments,
    enabled,
  });
}

export function useUpdateDoctorProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: DoctorProfileUpdateInput) => updateDoctorProfile(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.doctor.me });
      void queryClient.invalidateQueries({ queryKey: queryKeys.doctor.onboarding });
    },
  });
}

export function useSubmitVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: DoctorVerificationSubmitInput) =>
      submitDoctorVerification(payload),
    onSuccess: () => {
      persistDoctorAccessState("pending", true);
      void queryClient.invalidateQueries({ queryKey: queryKeys.doctor.me });
      void queryClient.invalidateQueries({ queryKey: queryKeys.doctor.onboarding });
    },
  });
}

export function useUploadDoctorDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      file: File;
      documentType: DoctorDocumentCreateInput["document_type"];
    }) => {
      const upload = await uploadStorageFile(
        {
          resource_type: "doctor_document",
          file_name: input.file.name,
        },
        input.file,
        input.file.name,
      );
      return createDoctorDocument({
        document_type: input.documentType,
        file_name: input.file.name,
        file_url: upload.object_key,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.doctor.documents });
      void queryClient.invalidateQueries({ queryKey: queryKeys.doctor.onboarding });
    },
    onError: (error) => {
      const apiError = error as unknown as ApiError;
      toast.error(apiError.message ?? "Unable to upload document");
    },
  });
}

export function useDeleteDoctorDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentId: string) => deleteDoctorDocument(documentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.doctor.documents });
      void queryClient.invalidateQueries({ queryKey: queryKeys.doctor.onboarding });
    },
  });
}
