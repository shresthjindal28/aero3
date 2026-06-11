"use client";

import Link from "next/link";

import { PatientForm } from "@/features/patients/components/patient-form";
import { useCreatePatient } from "@/features/patients/hooks/use-patient-mutations";
import {
  patientFormSchema,
  type PatientFormValues,
} from "@/features/patients/schemas/patient.schema";
import { formValuesToCreateInput } from "@/features/patients/utils/patient.utils";
import type { ApiError } from "@/lib/api/types/api-error.types";
import { routes } from "@/shared/constants/routes";
import { useZodForm } from "@/shared/forms/use-zod-form";
import { LoadingButton } from "@/shared/ui/buttons/loading-button";
import { PageContainer } from "@/shared/ui/layout/page-container";
import { PageHeader } from "@/shared/ui/layout/page-header";
import { Button } from "@/shared/ui/primitives/button";
import { toast } from "sonner";

const defaultValues: PatientFormValues = {
  full_name: "",
  phone: "",
  gender: "",
  date_of_birth: "",
  blood_group: "",
  allergies: "",
  medical_history: "",
  current_medications: "",
  emergency_contact_name: "",
  emergency_contact_phone: "",
  address: "",
  notes: "",
};

export function PatientCreatePage() {
  const createMutation = useCreatePatient();
  const form = useZodForm<PatientFormValues>(patientFormSchema, { defaultValues });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await createMutation.mutateAsync(formValuesToCreateInput(values));
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.fieldErrors) {
        Object.entries(apiError.fieldErrors).forEach(([field, message]) => {
          form.setError(field as keyof PatientFormValues, { message });
        });
      }
      if (!apiError.fieldErrors || Object.keys(apiError.fieldErrors).length === 0) {
        toast.error(apiError.message ?? "Unable to create patient");
      }
    }
  });

  return (
    <PageContainer className="max-w-4xl">
      <PageHeader
        title="Add patient"
        description="Capture the clinical context needed before consultations and sessions."
      />

      <div className="mt-8">
        <PatientForm form={form} onSubmit={onSubmit}>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button asChild variant="outline">
              <Link href={routes.app.patients}>Cancel</Link>
            </Button>
            <LoadingButton
              type="submit"
              loading={createMutation.isPending}
              loadingText="Creating patient..."
            >
              Create patient
            </LoadingButton>
          </div>
        </PatientForm>
      </div>
    </PageContainer>
  );
}
