"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useConsultation } from "@/features/consultations/hooks/use-consultation";
import { usePatient } from "@/features/patients/hooks/use-patient";
import { useGenerateSoap } from "@/features/soap/hooks/use-generate-soap";
import {
  useApproveSoapNote,
  useCreateSoapNote,
  useUpdateSoapNote,
} from "@/features/soap/hooks/use-soap-mutations";
import { useSoapNote } from "@/features/soap/hooks/use-soap-note";
import { useConsultationTranscript } from "@/features/soap/hooks/use-transcript";
import type { SoapDraft, SoapSectionKey } from "@/features/soap/types/soap.types";
import {
  draftToUpdateInput,
  draftsEqual,
  soapNoteToDraft,
} from "@/features/soap/utils/soap.utils";
import type { ApiError } from "@/lib/api/types/api-error.types";

const AUTOSAVE_DELAY_MS = 1_500;

const EMPTY_DRAFT: SoapDraft = {
  subjective: "",
  objective: "",
  assessment: "",
  plan: "",
};

export function useSoapWorkspace(consultationId: string) {
  const {
    data: consultation,
    isLoading: consultationLoading,
    error: consultationError,
  } = useConsultation(consultationId);
  const { data: patient, isLoading: patientLoading } = usePatient(
    consultation?.patient_id ?? "",
    Boolean(consultation?.patient_id),
  );

  const soapQuery = useSoapNote(consultationId);
  const transcriptQuery = useConsultationTranscript(consultationId);

  const createMutation = useCreateSoapNote(consultationId);
  const updateMutation = useUpdateSoapNote(consultationId);
  const approveMutation = useApproveSoapNote(consultationId);
  const generateSoap = useGenerateSoap(consultationId);

  const [draft, setDraft] = useState<SoapDraft>(EMPTY_DRAFT);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const savedDraftRef = useRef<SoapDraft>(EMPTY_DRAFT);
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hydratedSoapIdRef = useRef<string | null>(null);

  const soap = soapQuery.data;
  const isApproved = Boolean(soap?.approved_by_doctor);
  const isDirty = !draftsEqual(draft, savedDraftRef.current);
  const isSaving = updateMutation.isPending || createMutation.isPending;

  const hydrateDraft = useCallback((nextSoap: NonNullable<typeof soap>) => {
    const nextDraft = soapNoteToDraft(nextSoap);
    setDraft(nextDraft);
    savedDraftRef.current = nextDraft;
    hydratedSoapIdRef.current = nextSoap.id;
    setLastSavedAt(nextSoap.updated_at);
    setSaveError(null);
  }, []);

  useEffect(() => {
    if (soap && hydratedSoapIdRef.current !== soap.id) {
      hydrateDraft(soap);
    }
  }, [hydrateDraft, soap]);

  const saveDraft = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!isDirty || isApproved) return;
      setSaveError(null);

      try {
        if (!soap) {
          const created = await createMutation.mutateAsync(
            draftToUpdateInput(draft),
          );
          hydrateDraft(created);
          return;
        }

        const updated = await updateMutation.mutateAsync({
          soapNoteId: soap.id,
          input: draftToUpdateInput(draft),
        });
        hydrateDraft(updated);
        if (!options?.silent) {
          // Toast handled in mutation for create; update is silent by default for autosave
        }
      } catch (error) {
        const message =
          (error as ApiError).message ?? "Failed to save SOAP note";
        setSaveError(message);
        throw error;
      }
    },
    [
      createMutation,
      draft,
      hydrateDraft,
      isApproved,
      isDirty,
      soap,
      updateMutation,
    ],
  );

  useEffect(() => {
    if (!isDirty || isApproved) return;

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    autosaveTimerRef.current = setTimeout(() => {
      void saveDraft({ silent: true });
    }, AUTOSAVE_DELAY_MS);

    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, [draft, isApproved, isDirty, saveDraft]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void saveDraft();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [saveDraft]);

  const updateSection = (key: SoapSectionKey, value: string) => {
    if (isApproved) return;
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const generateSoapNote = async (regenerate = false) => {
    await generateSoap.generate({ regenerate });
    const refreshed = await soapQuery.refetch();
    if (refreshed.data) {
      hydrateDraft(refreshed.data);
    }
  };

  const approveSoap = async () => {
    let currentSoap = soap;

    if (!currentSoap) {
      currentSoap = await createMutation.mutateAsync(draftToUpdateInput(draft));
      hydrateDraft(currentSoap);
    } else if (isDirty) {
      currentSoap = await updateMutation.mutateAsync({
        soapNoteId: currentSoap.id,
        input: draftToUpdateInput(draft),
      });
      hydrateDraft(currentSoap);
    }

    await approveMutation.mutateAsync(currentSoap.id);
  };

  const soapMissing =
    !soapQuery.isLoading &&
    !soapQuery.isFetching &&
    (soapQuery.error as unknown as ApiError | undefined)?.status === 404;

  const transcriptMissing =
    !transcriptQuery.isLoading &&
    !transcriptQuery.isFetching &&
    (transcriptQuery.error as unknown as ApiError | undefined)?.status === 404;

  return {
    consultation,
    patient,
    soap,
    transcript: transcriptQuery.data,
    draft,
    isLoading: consultationLoading || patientLoading,
    isSoapLoading: soapQuery.isLoading,
    isTranscriptLoading: transcriptQuery.isLoading,
    consultationError,
    soapError: soapQuery.error,
    transcriptError: transcriptQuery.error,
    soapMissing,
    transcriptMissing,
    isDirty,
    isSaving,
    isApproved,
    isApproving: approveMutation.isPending,
    isCreating: createMutation.isPending,
    isGenerating: generateSoap.isGenerating,
    generationError: generateSoap.error,
    lastSavedAt,
    saveError,
    updateSection,
    saveDraft,
    approveSoap,
    generateSoapNote,
    refetchSoap: soapQuery.refetch,
    refetchTranscript: transcriptQuery.refetch,
  };
}
