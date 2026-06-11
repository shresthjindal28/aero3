import { AuthLayout } from "@/features/auth/components/auth-layout";
import { DoctorSignupForm } from "@/features/auth/components/doctor-signup-form";
import { routes } from "@/shared/constants/routes";

export default function DoctorSignupPage() {
  return (
    <AuthLayout
      title="Create your doctor account"
      description="Join AIRO to streamline your clinical documentation workflow."
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
