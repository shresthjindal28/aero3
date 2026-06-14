import { AuthLayout } from "@/features/auth/components/auth-layout";
import { DoctorLoginForm } from "@/features/auth/components/doctor-login-form";
import { routes } from "@/shared/constants/routes";

export default function DoctorLoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to pick up with your patients and today's notes."
      alternateLink={{
        label: "Need an account?",
        href: routes.auth.doctorSignup,
        linkText: "Sign up",
      }}
    >
      <DoctorLoginForm />
    </AuthLayout>
  );
}
