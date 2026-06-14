import { AuthLayout } from "@/features/auth/components/auth-layout";
import { DoctorSignupForm } from "@/features/auth/components/doctor-signup-form";
import { routes } from "@/shared/constants/routes";

export default function DoctorSignupPage() {
  return (
    <AuthLayout
      title="Create your account"
      description="A few details to get started — you'll finish your profile during onboarding."
      alternateLink={{
        label: "Already have an account?",
        href: routes.auth.doctorLogin,
        linkText: "Sign in",
      }}
    >
      <DoctorSignupForm />
    </AuthLayout>
  );
}
