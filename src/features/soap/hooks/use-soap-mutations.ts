"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  approveSoapNote,
  createSoapNote,
  updateSoapNote,
} from "@/features/soap/api/soap.api";
import type {
  SoapNoteCreateInput,
  SoapNoteUpdateInput,
} from "@/features/soap/types/soap.types";
import type { ApiError } from "@/lib/api/types/api-error.types";
import { queryKeys } from "@/shared/constants/query-keys";

export function useCreateSoapNote(consultationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Omit<SoapNoteCreateInput, "consultation_id">) =>
      createSoapNote({ ...input, consultation_id: consultationId }),
    onSuccess: (soap) => {
      queryClient.setQueryData(
        queryKeys.soap.byConsultation(consultationId),
        soap,
      );
      toast.success("SOAP note created");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Failed to create SOAP note");
    },
  });
}

export function useUpdateSoapNote(consultationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      soapNoteId,
      input,
    }: {
      soapNoteId: string;
      input: SoapNoteUpdateInput;
    }) => updateSoapNote(soapNoteId, input),
    onSuccess: (soap) => {
      queryClient.setQueryData(
        queryKeys.soap.byConsultation(consultationId),
        soap,
      );
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Failed to save SOAP note");
    },
  });
}

export function useApproveSoapNote(consultationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (soapNoteId: string) => approveSoapNote(soapNoteId),
    onSuccess: (soap) => {
      queryClient.setQueryData(
        queryKeys.soap.byConsultation(consultationId),
        soap,
      );
      toast.success("SOAP note approved");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Failed to approve SOAP note");
    },
  });
}
