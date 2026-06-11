"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type DefaultValues, type FieldValues } from "react-hook-form";
import type { z } from "zod";

export function useZodForm<TFieldValues extends FieldValues>(
  schema: z.ZodType<TFieldValues>,
  options?: {
    defaultValues?: DefaultValues<TFieldValues>;
  },
) {
  return useForm<TFieldValues>({
    resolver: zodResolver(schema),
    defaultValues: options?.defaultValues,
    mode: "onSubmit",
  });
}
