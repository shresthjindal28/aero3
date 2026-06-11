"use client";

import { FormProvider as RHFFormProvider, type UseFormReturn } from "react-hook-form";

type FormProviderProps<TFieldValues extends Record<string, unknown>> = {
  form: UseFormReturn<TFieldValues>;
  children: React.ReactNode;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
  className?: string;
};

export function FormProvider<TFieldValues extends Record<string, unknown>>({
  form,
  children,
  onSubmit,
  className,
}: FormProviderProps<TFieldValues>) {
  return (
    <RHFFormProvider {...form}>
      <form onSubmit={onSubmit} className={className}>
        {children}
      </form>
    </RHFFormProvider>
  );
}
