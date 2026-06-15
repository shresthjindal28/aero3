import { AuthLayout } from "@/features/auth/components/auth-layout";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";
import { routes } from "@/shared/constants/routes";

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Reset your password"
      description="We'll verify it's you with a code sent to your email and WhatsApp."
      alternateLink={{
        label: "Remember your password?",
        href: routes.auth.doctorLogin,
        linkText: "Sign in",
      }}
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
