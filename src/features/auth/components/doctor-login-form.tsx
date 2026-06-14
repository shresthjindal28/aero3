"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { AuthFormField } from "@/features/auth/components/auth-form-field";
import { AuthInput } from "@/features/auth/components/auth-input";
import { AuthSubmitButton } from "@/features/auth/components/auth-submit-button";
import { useDoctorLogin } from "@/features/auth/hooks/use-doctor-auth";
import { seedDoctorPostAuthCache } from "@/features/auth/utils/doctor-route-resolver";
import {
  loginSchema,
  type LoginFormValues,
} from "@/features/auth/schemas/login.schema";
import type { ApiError } from "@/lib/api/types/api-error.types";
import { useZodForm } from "@/shared/forms/use-zod-form";

export function DoctorLoginForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const loginMutation = useDoctorLogin();
  const form = useZodForm<LoginFormValues>(loginSchema, {
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await loginMutation.mutateAsync(values);
      toast.success("Welcome back");
      const route = await seedDoctorPostAuthCache(queryClient);
      router.replace(route);
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message ?? "Unable to sign in");
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <AuthFormField
        control={form.control}
        name="email"
        label="Email"
        render={({ field, id }) => (
          <AuthInput type="email" autoComplete="email" placeholder="you@yourclinic.com" id={id} {...field} />
        )}
      />
      <AuthFormField
        control={form.control}
        name="password"
        label="Password"
        render={({ field, id }) => (
          <AuthInput
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            id={id}
            {...field}
          />
        )}
      />
      <AuthSubmitButton loading={loginMutation.isPending} loadingText="Signing in…">
        Sign in
      </AuthSubmitButton>
    </form>
  );
}
