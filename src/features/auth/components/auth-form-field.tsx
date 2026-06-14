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

type AuthFormFieldProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  description?: string;
  render: (props: {
    field: ControllerRenderProps<TFieldValues, FieldPath<TFieldValues>>;
    id: string;
  }) => React.ReactNode;
};

export function AuthFormField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  render,
}: AuthFormFieldProps<TFieldValues>) {
  const fieldId = String(name);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className="space-y-2">
          <Label
            htmlFor={fieldId}
            className="text-sm font-normal text-stone-600 dark:text-stone-400"
          >
            {label}
          </Label>
          {description ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
          ) : null}
          {render({ field, id: fieldId })}
          <FormError message={fieldState.error?.message} />
        </div>
      )}
    />
  );
}
