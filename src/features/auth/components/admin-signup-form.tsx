"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { AuthFormField } from "@/features/auth/components/auth-form-field";
import { AuthInput } from "@/features/auth/components/auth-input";
import { AuthSubmitButton } from "@/features/auth/components/auth-submit-button";
import { useAdminSignup } from "@/features/auth/hooks/use-admin-auth";
import {
  adminSignupSchema,
  type AdminSignupFormValues,
} from "@/features/auth/schemas/signup.schema";
import type { ApiError } from "@/lib/api/types/api-error.types";
import { routes } from "@/shared/constants/routes";
import { useZodForm } from "@/shared/forms/use-zod-form";

export function AdminSignupForm() {
  const router = useRouter();
  const signupMutation = useAdminSignup();
  const form = useZodForm<AdminSignupFormValues>(adminSignupSchema, {
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await signupMutation.mutateAsync(values);
      toast.success("Admin account created. Please sign in.");
      router.replace(routes.auth.adminLogin);
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.fieldErrors) {
        Object.entries(apiError.fieldErrors).forEach(([field, message]) => {
          form.setError(field as keyof AdminSignupFormValues, { message });
        });
      }
      toast.error(apiError.message ?? "Unable to create account");
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <AuthFormField
        control={form.control}
        name="full_name"
        label="Full name"
        render={({ field, id }) => (
          <AuthInput autoComplete="name" placeholder="Operations lead" id={id} {...field} />
        )}
      />
      <AuthFormField
        control={form.control}
        name="email"
        label="Work email"
        render={({ field, id }) => (
          <AuthInput type="email" autoComplete="email" placeholder="admin@airo.com" id={id} {...field} />
        )}
      />
      <AuthFormField
        control={form.control}
        name="password"
        label="Password"
        description="Minimum 8 characters"
        render={({ field, id }) => (
          <AuthInput
            type="password"
            autoComplete="new-password"
            placeholder="Create a secure password"
            id={id}
            {...field}
          />
        )}
      />
      <AuthSubmitButton
        loading={signupMutation.isPending}
        loadingText="Creating account..."
      >
        Create admin account
      </AuthSubmitButton>
    </form>
  );
}
