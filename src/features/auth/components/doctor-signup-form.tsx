"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { doctorLogin } from "@/features/auth/api/doctor-auth.api";
import { useDoctorSignup } from "@/features/auth/hooks/use-doctor-auth";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useTokenStore } from "@/features/auth/store/token.store";
import { resolveDoctorPostAuthRoute } from "@/features/auth/utils/doctor-route-resolver";
import {
  doctorSignupSchema,
  type DoctorSignupFormValues,
} from "@/features/auth/schemas/signup.schema";
import type { ApiError } from "@/lib/api/types/api-error.types";
import { FormField } from "@/shared/forms/form-field";
import { FormSection } from "@/shared/forms/form-section";
import { useZodForm } from "@/shared/forms/use-zod-form";
import { LoadingButton } from "@/shared/ui/buttons/loading-button";
import { Input } from "@/shared/ui/primitives/input";

export function DoctorSignupForm() {
  const router = useRouter();
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

      const tokens = await doctorLogin({
        email: values.email,
        password: values.password,
      });

      useTokenStore.getState().setTokens({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        actorType: "doctor",
      });
      useAuthStore.getState().setSession("doctor");

      toast.success("Account created. Complete your onboarding profile.");
      const route = await resolveDoctorPostAuthRoute();
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
      <FormSection
        title="Account"
        description="Create your account. All professional details are collected during onboarding."
      >
        <div className="space-y-4">
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
        </div>
      </FormSection>

      <LoadingButton
        type="submit"
        className="w-full"
        loading={signupMutation.isPending}
        loadingText="Creating account..."
      >
        Create account
      </LoadingButton>
    </form>
  );
}
