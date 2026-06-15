import { z } from "zod";

export const forgotPasswordEmailSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

export const verifyResetOtpSchema = z.object({
  otp: z
    .string()
    .length(6, "Enter the 6-digit code")
    .regex(/^\d{6}$/, "Code must be 6 digits"),
});

export const resetPasswordSchema = z
  .object({
    email: z.string().email("Enter a valid email address"),
    reset_token: z.string().min(1),
    new_password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string().min(8, "Confirm your password"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export type ForgotPasswordEmailValues = z.infer<typeof forgotPasswordEmailSchema>;
export type VerifyResetOtpValues = z.infer<typeof verifyResetOtpSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
