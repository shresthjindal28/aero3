"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { doctorLogin } from "@/features/auth/api/doctor-auth.api";
import { AuthFormField } from "@/features/auth/components/auth-form-field";
import { AuthInput } from "@/features/auth/components/auth-input";
import { AuthSubmitButton } from "@/features/auth/components/auth-submit-button";
import { useDoctorSignup } from "@/features/auth/hooks/use-doctor-auth";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useTokenStore } from "@/features/auth/store/token.store";
import { seedDoctorPostAuthCacheFromLogin } from "@/features/auth/utils/doctor-route-resolver";
import {
  doctorSignupSchema,
  type DoctorSignupFormValues,
} from "@/features/auth/schemas/signup.schema";
import type { ApiError } from "@/lib/api/types/api-error.types";
import { useZodForm } from "@/shared/forms/use-zod-form";

export function DoctorSignupForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const signupMutation = useDoctorSignup();
  const form = useZodForm<DoctorSignupFormValues>(doctorSignupSchema, {
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await signupMutation.mutateAsync(values);

      const login = await doctorLogin({
        email: values.email,
        password: values.password,
      });

      useTokenStore.getState().setTokens({
        accessToken: login.access_token,
        refreshToken: login.refresh_token,
        actorType: "doctor",
      });
      useAuthStore.getState().setSession("doctor");

      toast.success("Account created. Complete your onboarding profile.");
      const route = seedDoctorPostAuthCacheFromLogin(
        queryClient,
        login.doctor,
        login.onboarding_status,
      );
      router.replace(route);
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.fieldErrors) {
        Object.entries(apiError.fieldErrors).forEach(([field, message]) => {
          form.setError(field as keyof DoctorSignupFormValues, { message });
        });
      }
      toast.error(apiError.message ?? "Unable to create account");
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-5">
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-stone-800 dark:text-stone-200">
            Your details
          </h3>
          <p className="text-xs leading-relaxed text-stone-500 dark:text-stone-400">
            License and clinic info comes later, during onboarding.
          </p>
        </div>

        <div className="space-y-4">
          <AuthFormField
            control={form.control}
            name="full_name"
            label="Full name"
            render={({ field, id }) => (
              <AuthInput autoComplete="name" placeholder="Dr. Jane Smith" id={id} {...field} />
            )}
          />
          <AuthFormField
            control={form.control}
            name="email"
            label="Work email"
            render={({ field, id }) => (
              <AuthInput
                type="email"
                autoComplete="email"
                placeholder="you@clinic.com"
                id={id}
                {...field}
              />
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
        </div>
      </div>

      <AuthSubmitButton
        loading={signupMutation.isPending}
        loadingText="Creating account…"
      >
        Create account
      </AuthSubmitButton>
    </form>
  );
}
