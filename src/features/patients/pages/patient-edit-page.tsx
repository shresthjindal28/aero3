"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import { PatientForm } from "@/features/patients/components/patient-form";
import { usePatient } from "@/features/patients/hooks/use-patient";
import { useUpdatePatient } from "@/features/patients/hooks/use-patient-mutations";
import {
  patientFormSchema,
  type PatientFormValues,
} from "@/features/patients/schemas/patient.schema";
import {
  formValuesToCreateInput,
  patientToFormValues,
} from "@/features/patients/utils/patient.utils";
import type { ApiError } from "@/lib/api/types/api-error.types";
import { routes } from "@/shared/constants/routes";
import { useZodForm } from "@/shared/forms/use-zod-form";
import { LoadingButton } from "@/shared/ui/buttons/loading-button";
import { ApiErrorDisplay } from "@/shared/ui/feedback/api-error";
import { PageLoader } from "@/shared/ui/feedback/page-loader";
import { PageContainer } from "@/shared/ui/layout/page-container";
import { PageHeader } from "@/shared/ui/layout/page-header";
import { Button } from "@/shared/ui/primitives/button";
import { useEffect, useRef } from "react";

export function PatientEditPage() {
  const params = useParams<{ patientId: string }>();
  const patientId = params.patientId;
  const { data: patient, isLoading, isError, error, refetch } = usePatient(patientId);
  const updateMutation = useUpdatePatient(patientId);
  const form = useZodForm<PatientFormValues>(patientFormSchema);
  const hydratedPatientId = useRef<string | null>(null);

  useEffect(() => {
    if (patient && hydratedPatientId.current !== patient.id) {
      form.reset(patientToFormValues(patient));
      hydratedPatientId.current = patient.id;
    }
  }, [patient, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await updateMutation.mutateAsync(formValuesToCreateInput(values));
    } catch (submitError) {
      const apiError = submitError as ApiError;
      if (apiError.fieldErrors) {
        Object.entries(apiError.fieldErrors).forEach(([field, message]) => {
          form.setError(field as keyof PatientFormValues, { message });
        });
      }
      if (!apiError.fieldErrors || Object.keys(apiError.fieldErrors).length === 0) {
        toast.error(apiError.message ?? "Unable to update patient");
      }
    }
  });

  if (isLoading) {
    return <PageLoader label="Loading patient..." />;
  }

  if (isError || !patient) {
    return (
      <PageContainer>
        <ApiErrorDisplay
          error={(error as Error) ?? new Error("Patient not found")}
          onRetry={() => void refetch()}
          title="Unable to load patient"
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="max-w-4xl">
      <PageHeader
        title={`Edit ${patient.full_name}`}
        description="Update patient demographics and clinical context."
      />

      <div className="mt-8">
        <PatientForm form={form} onSubmit={onSubmit}>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button asChild variant="outline">
              <Link href={routes.app.patientDetail(patientId)}>Cancel</Link>
            </Button>
            <LoadingButton
              type="submit"
              loading={updateMutation.isPending}
              loadingText="Saving changes..."
            >
              Save changes
            </LoadingButton>
          </div>
        </PatientForm>
      </div>
    </PageContainer>
  );
}
