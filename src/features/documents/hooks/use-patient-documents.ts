"use client";

import { useQuery } from "@tanstack/react-query";

import { listConsultations } from "@/features/consultations/api/consultations.api";
import { listConsultationDocuments } from "@/features/documents/api/documents.api";
import type { PatientDocumentItem } from "@/features/documents/types/document.types";
import { queryKeys } from "@/shared/constants/query-keys";

export function usePatientDocuments(patientId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.documents.byPatient(patientId),
    queryFn: async (): Promise<PatientDocumentItem[]> => {
      const consultations = await listConsultations(patientId);
      const documentGroups = await Promise.all(
        consultations.map(async (consultation) => {
          const docs = await listConsultationDocuments(consultation.id);
          return docs.map((doc) => ({
            ...doc,
            consultationLabel: consultation.chief_complaint ?? "Consultation",
            patientId,
          }));
        }),
      );
      return documentGroups.flat().sort(
        (a, b) =>
          new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime(),
      );
    },
    enabled: enabled && Boolean(patientId),
  });
}
