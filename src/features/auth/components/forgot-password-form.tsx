"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import {
  requestPasswordReset,
  resetDoctorPassword,
  verifyPasswordResetOtp,
} from "@/features/auth/api/doctor-auth.api";
import { AuthFormField } from "@/features/auth/components/auth-form-field";
import { AuthInput } from "@/features/auth/components/auth-input";
import { AuthPasswordInput } from "@/features/auth/components/auth-password-input";
import { AuthSubmitButton } from "@/features/auth/components/auth-submit-button";
import {
  forgotPasswordEmailSchema,
  resetPasswordSchema,
  verifyResetOtpSchema,
  type ForgotPasswordEmailValues,
  type ResetPasswordValues,
  type VerifyResetOtpValues,
} from "@/features/auth/schemas/forgot-password.schema";
import type { ApiError } from "@/lib/api/types/api-error.types";
import { routes } from "@/shared/constants/routes";
import { useZodForm } from "@/shared/forms/use-zod-form";
import { Button } from "@/shared/ui/primitives/button";

type Step = "email" | "otp" | "password";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [deliveryChannels, setDeliveryChannels] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailForm = useZodForm<ForgotPasswordEmailValues>(forgotPasswordEmailSchema, {
    defaultValues: { email: "" },
  });

  const otpForm = useZodForm<VerifyResetOtpValues>(verifyResetOtpSchema, {
    defaultValues: { otp: "" },
  });

  const passwordForm = useZodForm<ResetPasswordValues>(resetPasswordSchema, {
    defaultValues: {
      email: "",
      reset_token: "",
      new_password: "",
      confirm_password: "",
    },
  });

  const onRequestOtp = emailForm.handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      const result = await requestPasswordReset(values.email);
      setEmail(values.email);
      setDeliveryChannels(result.channels);
      setStep("otp");
      const label =
        result.channels.length === 2
          ? "registered email and WhatsApp"
          : result.channels.includes("whatsapp")
            ? "registered WhatsApp number"
            : "registered email";
      toast.success(
        result.channels.length
          ? `Verification code sent to your ${label}.`
          : result.message,
      );
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message ?? "Unable to send verification code");
    } finally {
      setIsSubmitting(false);
    }
  });

  const onVerifyOtp = otpForm.handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      const result = await verifyPasswordResetOtp(email, values.otp);
      setResetToken(result.reset_token);
      passwordForm.setValue("email", email);
      passwordForm.setValue("reset_token", result.reset_token);
      setStep("password");
      toast.success("Code verified");
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message ?? "Invalid verification code");
    } finally {
      setIsSubmitting(false);
    }
  });

  const onResetPassword = passwordForm.handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      await resetDoctorPassword({
        email: values.email,
        reset_token: resetToken || values.reset_token,
        new_password: values.new_password,
      });
      toast.success("Password updated — sign in with your new password");
      router.replace(routes.auth.doctorLogin);
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message ?? "Unable to reset password");
    } finally {
      setIsSubmitting(false);
    }
  });

  if (step === "email") {
    return (
      <form onSubmit={onRequestOtp} className="space-y-5">
        <p className="text-sm text-muted-foreground">
          Enter your account email. We&apos;ll send a 6-digit code to your registered
          email and mobile number on WhatsApp.
        </p>
        <AuthFormField
          control={emailForm.control}
          name="email"
          label="Email"
          render={({ field, id }) => (
            <AuthInput
              type="email"
              autoComplete="email"
              placeholder="you@yourclinic.com"
              id={id}
              {...field}
            />
          )}
        />
        <AuthSubmitButton loading={isSubmitting} loadingText="Sending code…">
          Send verification code
        </AuthSubmitButton>
        <Button type="button" variant="ghost" className="w-full" asChild>
          <Link href={routes.auth.doctorLogin}>Back to sign in</Link>
        </Button>
      </form>
    );
  }

  if (step === "otp") {
    return (
      <form onSubmit={onVerifyOtp} className="space-y-5">
        <p className="text-sm text-muted-foreground">
          Enter the 6-digit code sent to <span className="font-medium">{email}</span>
          {deliveryChannels.includes("whatsapp") ? " and your WhatsApp number" : ""}.
        </p>
        <AuthFormField
          control={otpForm.control}
          name="otp"
          label="Verification code"
          render={({ field, id }) => (
            <AuthInput
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="000000"
              maxLength={6}
              id={id}
              {...field}
            />
          )}
        />
        <AuthSubmitButton loading={isSubmitting} loadingText="Verifying…">
          Verify code
        </AuthSubmitButton>
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => {
              setStep("email");
              emailForm.setValue("email", email);
            }}
          >
            Use a different email
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={isSubmitting}
            onClick={async () => {
              setIsSubmitting(true);
              try {
                const result = await requestPasswordReset(email);
                setDeliveryChannels(result.channels);
                toast.success("New code sent");
              } catch (error) {
                toast.error((error as ApiError).message ?? "Unable to resend code");
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
            Resend code
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={onResetPassword} className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Choose a new password for <span className="font-medium">{email}</span>.
      </p>
      <AuthFormField
        control={passwordForm.control}
        name="new_password"
        label="New password"
        render={({ field, id }) => (
          <AuthPasswordInput
            autoComplete="new-password"
            placeholder="At least 8 characters"
            id={id}
            {...field}
          />
        )}
      />
      <AuthFormField
        control={passwordForm.control}
        name="confirm_password"
        label="Confirm password"
        render={({ field, id }) => (
          <AuthPasswordInput
            autoComplete="new-password"
            placeholder="Repeat your password"
            id={id}
            {...field}
          />
        )}
      />
      <input type="hidden" {...passwordForm.register("email")} value={email} />
      <input type="hidden" {...passwordForm.register("reset_token")} value={resetToken} />
      <AuthSubmitButton loading={isSubmitting} loadingText="Updating…">
        Update password
      </AuthSubmitButton>
    </form>
  );
}
