"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { AuthFormField } from "@/features/auth/components/auth-form-field";
import { AuthInput } from "@/features/auth/components/auth-input";
import { AuthSubmitButton } from "@/features/auth/components/auth-submit-button";
import {
  getAdminPostLoginRoute,
  useAdminLogin,
} from "@/features/auth/hooks/use-admin-auth";
import {
  loginSchema,
  type LoginFormValues,
} from "@/features/auth/schemas/login.schema";
import type { ApiError } from "@/lib/api/types/api-error.types";
import { useZodForm } from "@/shared/forms/use-zod-form";

export function AdminLoginForm() {
  const router = useRouter();
  const loginMutation = useAdminLogin();
  const form = useZodForm<LoginFormValues>(loginSchema, {
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await loginMutation.mutateAsync(values);
      toast.success("Welcome back");
      router.replace(getAdminPostLoginRoute());
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
        label="Admin email"
        render={({ field, id }) => (
          <AuthInput type="email" autoComplete="email" placeholder="admin@airo.com" id={id} {...field} />
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
      <AuthSubmitButton loading={loginMutation.isPending} loadingText="Signing in...">
        Sign in to admin console
      </AuthSubmitButton>
    </form>
  );
}
