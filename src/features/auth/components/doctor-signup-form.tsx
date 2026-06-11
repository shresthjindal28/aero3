"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useDoctorSignup } from "@/features/auth/hooks/use-doctor-auth";
import {
  doctorSignupSchema,
  type DoctorSignupFormValues,
} from "@/features/auth/schemas/signup.schema";
import type { ApiError } from "@/lib/api/types/api-error.types";
import { routes } from "@/shared/constants/routes";
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
      phone: "",
      specialization: "",
      qualification: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await signupMutation.mutateAsync({
        ...values,
        phone: values.phone || undefined,
        specialization: values.specialization || undefined,
        qualification: values.qualification || undefined,
      });
      toast.success("Account created. Please sign in.");
      router.replace(routes.auth.doctorLogin);
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
      <FormSection title="Account" description="Create your doctor account.">
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

      <FormSection title="Professional details" description="Optional for now.">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="phone"
            label="Phone"
            render={({ field }) => <Input type="tel" autoComplete="tel" {...field} />}
          />
          <FormField
            control={form.control}
            name="specialization"
            label="Specialization"
            render={({ field }) => <Input {...field} />}
          />
          <FormField
            control={form.control}
            name="qualification"
            label="Qualification"
            render={({ field }) => <Input {...field} />}
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
