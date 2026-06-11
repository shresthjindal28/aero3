"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useDoctorLogin } from "@/features/auth/hooks/use-doctor-auth";
import { resolveDoctorPostAuthRoute } from "@/features/auth/utils/doctor-route-resolver";
import {
  loginSchema,
  type LoginFormValues,
} from "@/features/auth/schemas/login.schema";
import type { ApiError } from "@/lib/api/types/api-error.types";
import { FormField } from "@/shared/forms/form-field";
import { useZodForm } from "@/shared/forms/use-zod-form";
import { LoadingButton } from "@/shared/ui/buttons/loading-button";
import { Input } from "@/shared/ui/primitives/input";

export function DoctorLoginForm() {
  const router = useRouter();
  const loginMutation = useDoctorLogin();
  const form = useZodForm<LoginFormValues>(loginSchema, {
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await loginMutation.mutateAsync(values);
      toast.success("Welcome back");
      const route = await resolveDoctorPostAuthRoute();
      router.replace(route);
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
