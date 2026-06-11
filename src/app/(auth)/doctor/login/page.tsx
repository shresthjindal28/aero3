import { AuthLayout } from "@/features/auth/components/auth-layout";
import { DoctorLoginForm } from "@/features/auth/components/doctor-login-form";
import { routes } from "@/shared/constants/routes";

export default function DoctorLoginPage() {
  return (
    <AuthLayout
      title="Sign in to your workspace"
      description="Access consultations, transcripts, and clinical memory."
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
