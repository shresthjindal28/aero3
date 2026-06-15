"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { AuthFormField } from "@/features/auth/components/auth-form-field";
import { AuthInput } from "@/features/auth/components/auth-input";
import { AuthPasswordInput } from "@/features/auth/components/auth-password-input";
import { AuthSubmitButton } from "@/features/auth/components/auth-submit-button";
import { useDoctorLogin } from "@/features/auth/hooks/use-doctor-auth";
import { seedDoctorPostAuthCacheFromLogin } from "@/features/auth/utils/doctor-route-resolver";
import {
  loginSchema,
  type LoginFormValues,
} from "@/features/auth/schemas/login.schema";
import type { ApiError } from "@/lib/api/types/api-error.types";
import { routes } from "@/shared/constants/routes";
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
      const login = await loginMutation.mutateAsync(values);
      toast.success("Welcome back");
      const route = seedDoctorPostAuthCacheFromLogin(
        queryClient,
        login.doctor,
        login.onboarding_status,
      );
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
          <AuthPasswordInput
            autoComplete="current-password"
            placeholder="Enter your password"
            id={id}
            {...field}
          />
        )}
      />
      <div className="flex items-center justify-end">
        <Link
          href={routes.auth.doctorForgotPassword}
          className="text-sm font-medium text-teal-800 underline decoration-teal-800/30 underline-offset-4 hover:text-teal-900 dark:text-teal-400 dark:hover:text-teal-300"
        >
          Forgot password?
        </Link>
      </div>
      <AuthSubmitButton loading={loginMutation.isPending} loadingText="Signing in…">
        Sign in
      </AuthSubmitButton>
    </form>
  );
}
