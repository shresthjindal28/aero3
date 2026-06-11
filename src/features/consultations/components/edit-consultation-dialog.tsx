"use client";

import {
  updateConsultationSchema,
  type UpdateConsultationFormValues,
} from "@/features/consultations/schemas/consultation.schema";
import { useUpdateConsultation } from "@/features/consultations/hooks/use-consultation-mutations";
import type { Consultation } from "@/features/consultations/types/consultation.types";
import { FormField } from "@/shared/forms/form-field";
import { useZodForm } from "@/shared/forms/use-zod-form";
import { LoadingButton } from "@/shared/ui/buttons/loading-button";
import { Button } from "@/shared/ui/primitives/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/primitives/dialog";
import { Input } from "@/shared/ui/primitives/input";
import { Select } from "@/shared/ui/primitives/select";
import { useEffect } from "react";

type EditConsultationDialogProps = {
  consultation: Consultation;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditConsultationDialog({
  consultation,
  open,
  onOpenChange,
}: EditConsultationDialogProps) {
  const updateMutation = useUpdateConsultation(consultation.id, consultation.patient_id);
  const form = useZodForm<UpdateConsultationFormValues>(updateConsultationSchema);

  useEffect(() => {
    if (open) {
      form.reset({
        chief_complaint: consultation.chief_complaint ?? "",
        status: consultation.status,
      });
    }
  }, [consultation, form, open]);

  const onSubmit = form.handleSubmit(async (values) => {
    await updateMutation.mutateAsync(values);
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit consultation</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <FormField
            control={form.control}
            name="chief_complaint"
            label="Chief complaint"
            render={({ field }) => <Input {...field} />}
          />
          <FormField
            control={form.control}
            name="status"
            label="Status"
            render={({ field }) => (
              <Select
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
              >
                <option value="scheduled">Scheduled</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </Select>
            )}
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <LoadingButton
              type="submit"
              loading={updateMutation.isPending}
              loadingText="Saving..."
            >
              Save changes
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
