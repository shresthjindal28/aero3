import { AuthLayout } from "@/features/auth/components/auth-layout";
import { AdminLoginForm } from "@/features/auth/components/admin-login-form";
import { routes } from "@/shared/constants/routes";

export default function AdminLoginPage() {
  return (
    <AuthLayout
      title="Admin sign in"
      description="Manage doctors, monitor AI jobs, and operate the platform."
      alternateLink={{
        label: "Doctor portal?",
        href: routes.auth.doctorLogin,
        linkText: "Sign in as doctor",
      }}
    >
      <AdminLoginForm />
    </AuthLayout>
  );
}
