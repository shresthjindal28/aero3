"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  getAdminPostLoginRoute,
  useAdminLogin,
} from "@/features/auth/hooks/use-admin-auth";
import {
  loginSchema,
  type LoginFormValues,
} from "@/features/auth/schemas/login.schema";
import type { ApiError } from "@/lib/api/types/api-error.types";
import { FormField } from "@/shared/forms/form-field";
import { useZodForm } from "@/shared/forms/use-zod-form";
import { LoadingButton } from "@/shared/ui/buttons/loading-button";
import { Input } from "@/shared/ui/primitives/input";

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
    <form onSubmit={onSubmit} className="space-y-4">
      <FormField
        control={form.control}
        name="email"
        label="Email"
        render={({ field }) => <Input type="email" autoComplete="email" {...field} />}
      />
      <FormField
        control={form.control}
        name="password"
        label="Password"
        render={({ field }) => (
          <Input type="password" autoComplete="current-password" {...field} />
        )}
      />
      <LoadingButton
        type="submit"
        className="w-full"
        loading={loginMutation.isPending}
        loadingText="Signing in..."
      >
        Sign in
      </LoadingButton>
    </form>
  );
}
