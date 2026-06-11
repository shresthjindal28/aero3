"use client";

import {
  createConsultationSchema,
  type CreateConsultationFormValues,
} from "@/features/consultations/schemas/consultation.schema";
import { useCreateConsultation } from "@/features/consultations/hooks/use-consultation-mutations";
import { buildChiefComplaintPayload } from "@/features/consultations/utils/consultation.utils";
import type { ApiError } from "@/lib/api/types/api-error.types";
import { FormField } from "@/shared/forms/form-field";
import { useZodForm } from "@/shared/forms/use-zod-form";
import { LoadingButton } from "@/shared/ui/buttons/loading-button";
import { Input } from "@/shared/ui/primitives/input";
import { Textarea } from "@/shared/ui/primitives/textarea";
import { toast } from "sonner";

type CreateConsultationFormProps = {
  patientId: string;
  onCancel?: () => void;
};

export function CreateConsultationForm({
  patientId,
  onCancel,
}: CreateConsultationFormProps) {
  const createMutation = useCreateConsultation(patientId);
  const form = useZodForm<CreateConsultationFormValues>(createConsultationSchema, {
    defaultValues: {
      chief_complaint: "",
      notes: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await createMutation.mutateAsync({
        chief_complaint: buildChiefComplaintPayload(
          values.chief_complaint,
          values.notes,
        ),
        status: "scheduled",
      });
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.fieldErrors) {
        Object.entries(apiError.fieldErrors).forEach(([field, message]) => {
          form.setError(field as keyof CreateConsultationFormValues, { message });
        });
      } else {
        toast.error(apiError.message ?? "Unable to create consultation");
      }
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <FormField
        control={form.control}
        name="chief_complaint"
        label="Chief complaint"
        description="What brought the patient in today?"
        render={({ field }) => <Input placeholder="e.g. Persistent headache for 3 days" {...field} />}
      />
      <FormField
        control={form.control}
        name="notes"
        label="Notes"
        description="Optional context for this consultation."
        render={({ field }) => (
          <Textarea rows={4} placeholder="Additional clinical context..." {...field} />
        )}
      />
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {onCancel ? (
          <LoadingButton type="button" variant="outline" onClick={onCancel}>
            Cancel
          </LoadingButton>
        ) : null}
        <LoadingButton
          type="submit"
          loading={createMutation.isPending}
          loadingText="Creating consultation..."
        >
          Create consultation
        </LoadingButton>
      </div>
    </form>
  );
}
