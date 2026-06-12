"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useConsultation } from "@/features/consultations/hooks/use-consultation";
import { usePatient } from "@/features/patients/hooks/use-patient";
import { useGeneratePrescription } from "@/features/prescription/hooks/use-generate-prescription";
import {
  useApprovePrescription,
  useExportPrescriptionAudit,
  usePrintPrescriptionAudit,
  useUpdatePrescription,
} from "@/features/prescription/hooks/use-prescription-mutations";
import { usePrescriptionNote } from "@/features/prescription/hooks/use-prescription-note";
import { useSoapNote } from "@/features/soap/hooks/use-soap-note";
import type { ApiError } from "@/lib/api/types/api-error.types";

const AUTOSAVE_DELAY_MS = 1_500;

export function usePrescriptionWorkspace(consultationId: string) {
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
  const prescriptionQuery = usePrescriptionNote(consultationId);
  const updateMutation = useUpdatePrescription(consultationId);
  const approveMutation = useApprovePrescription(consultationId);
  const exportAuditMutation = useExportPrescriptionAudit(consultationId);
  const printAuditMutation = usePrintPrescriptionAudit(consultationId);
  const generatePrescription = useGeneratePrescription(consultationId);

  const [htmlDraft, setHtmlDraft] = useState("");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isRevising, setIsRevising] = useState(false);

  const savedHtmlRef = useRef("");
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hydratedPrescriptionIdRef = useRef<string | null>(null);

  const prescription = prescriptionQuery.data;
  const soap = soapQuery.data;
  const isApproved = Boolean(
    prescription?.is_approved ?? prescription?.approved_by_doctor,
  );
  const isReadOnly = isApproved && !isRevising;
  const isDirty = htmlDraft !== savedHtmlRef.current;
  const isSaving = updateMutation.isPending;
  const documentVersion = prescription?.version_number ?? 0;

  const hydrateDraft = useCallback(
    (nextPrescription: NonNullable<typeof prescription>) => {
      setHtmlDraft(nextPrescription.html_content);
      savedHtmlRef.current = nextPrescription.html_content;
      hydratedPrescriptionIdRef.current = nextPrescription.id;
      setLastSavedAt(nextPrescription.updated_at);
      setSaveError(null);
      if (nextPrescription.is_approved) {
        setIsRevising(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (prescription && hydratedPrescriptionIdRef.current !== prescription.id) {
      hydrateDraft(prescription);
    }
  }, [hydrateDraft, prescription]);

  const saveDraft = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!prescription || !isDirty || isReadOnly) return;
      setSaveError(null);

      try {
        const updated = await updateMutation.mutateAsync({
          prescriptionId: prescription.id,
          input: { html_content: htmlDraft },
        });
        hydrateDraft(updated);
        if (!options?.silent && updated.version_number > prescription.version_number) {
          setIsRevising(false);
        }
      } catch (error) {
        const message =
          (error as ApiError).message ?? "Failed to save prescription";
        setSaveError(message);
        throw error;
      }
    },
    [htmlDraft, hydrateDraft, isDirty, isReadOnly, prescription, updateMutation],
  );

  useEffect(() => {
    if (!isDirty || isReadOnly || !prescription) return;

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
  }, [htmlDraft, isDirty, isReadOnly, prescription, saveDraft]);

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

  const generate = async (regenerate = false) => {
    await generatePrescription.generate(regenerate);
    const refreshed = await prescriptionQuery.refetch();
    if (refreshed.data) {
      hydrateDraft(refreshed.data);
    }
  };

  const approve = async () => {
    if (!prescription) return;

    if (isDirty) {
      const updated = await updateMutation.mutateAsync({
        prescriptionId: prescription.id,
        input: { html_content: htmlDraft },
      });
      hydrateDraft(updated);
      await approveMutation.mutateAsync(updated.id);
      return;
    }

    await approveMutation.mutateAsync(prescription.id);
  };

  const startRevision = () => {
    setIsRevising(true);
  };

  const logExport = async () => {
    if (!prescription) return;
    await exportAuditMutation.mutateAsync(prescription.id);
  };

  const logPrint = async () => {
    if (!prescription) return;
    await printAuditMutation.mutateAsync(prescription.id);
  };

  const soapMissing =
    !soapQuery.isLoading &&
    !soapQuery.isFetching &&
    (soapQuery.error as unknown as ApiError | undefined)?.status === 404;

  const soapNotApproved =
    Boolean(soap) &&
    !soap?.approved_by_doctor &&
    !soapQuery.isLoading &&
    !soapQuery.isFetching;

  const prescriptionMissing =
    !prescriptionQuery.isLoading &&
    !prescriptionQuery.isFetching &&
    (prescriptionQuery.error as unknown as ApiError | undefined)?.status === 404;

  return {
    consultation,
    patient,
    soap,
    prescription,
    htmlDraft,
    setHtmlDraft,
    documentVersion,
    isLoading: consultationLoading || patientLoading,
    isPrescriptionLoading: prescriptionQuery.isLoading,
    isSoapLoading: soapQuery.isLoading,
    consultationError,
    soapMissing,
    soapNotApproved,
    prescriptionMissing,
    isDirty,
    isSaving,
    isApproved,
    isReadOnly,
    isRevising,
    startRevision,
    isApproving: approveMutation.isPending,
    isGenerating: generatePrescription.isGenerating,
    generationError: generatePrescription.error,
    lastSavedAt,
    saveError,
    saveDraft,
    approve,
    generate,
    logExport,
    logPrint,
    refetchPrescription: prescriptionQuery.refetch,
  };
}
