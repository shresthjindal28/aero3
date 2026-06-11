"use client";

import {
  Controller,
  type Control,
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import { FormError } from "@/shared/forms/form-error";
import { Label } from "@/shared/ui/primitives/label";

type FormFieldProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  description?: string;
  render: (props: {
    field: ControllerRenderProps<TFieldValues, FieldPath<TFieldValues>>;
  }) => React.ReactNode;
};

export function FormField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  render,
}: FormFieldProps<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className="space-y-2">
          <Label htmlFor={String(name)}>{label}</Label>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
          {render({ field })}
          <FormError message={fieldState.error?.message} />
        </div>
      )}
    />
  );
}
