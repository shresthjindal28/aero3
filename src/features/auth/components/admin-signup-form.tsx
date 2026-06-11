"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useAdminSignup } from "@/features/auth/hooks/use-admin-auth";
import {
  adminSignupSchema,
  type AdminSignupFormValues,
} from "@/features/auth/schemas/signup.schema";
import type { ApiError } from "@/lib/api/types/api-error.types";
import { routes } from "@/shared/constants/routes";
import { FormField } from "@/shared/forms/form-field";
import { useZodForm } from "@/shared/forms/use-zod-form";
import { LoadingButton } from "@/shared/ui/buttons/loading-button";
import { Input } from "@/shared/ui/primitives/input";

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
    <form onSubmit={onSubmit} className="space-y-4">
      <FormField
        control={form.control}
        name="full_name"
        label="Full name"
        render={({ field }) => <Input autoComplete="name" {...field} />}
      />
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
        description="Minimum 8 characters"
        render={({ field }) => (
          <Input type="password" autoComplete="new-password" {...field} />
        )}
      />
      <LoadingButton
        type="submit"
        className="w-full"
        loading={signupMutation.isPending}
        loadingText="Creating account..."
      >
        Create admin account
      </LoadingButton>
    </form>
  );
}
