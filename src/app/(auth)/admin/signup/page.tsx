import { AuthLayout } from "@/features/auth/components/auth-layout";
import { AdminSignupForm } from "@/features/auth/components/admin-signup-form";
import { routes } from "@/shared/constants/routes";

export default function AdminSignupPage() {
  return (
    <AuthLayout
      title="Create admin account"
      description="Provision a new operations account for the AIRO platform."
      alternateLink={{
        label: "Already have an account?",
        href: routes.auth.adminLogin,
        linkText: "Sign in",
      }}
    >
      <AdminSignupForm />
    </AuthLayout>
  );
}
