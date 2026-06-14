import { AuthBrandingPanel } from "@/features/auth/components/auth-branding-panel";
import { AuthFormShell } from "@/features/auth/components/auth-form-shell";

type AuthLayoutProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  alternateLink?: {
    label: string;
    href: string;
    linkText: string;
  };
  className?: string;
};

export function AuthLayout({
  title,
  description,
  children,
  footer,
  alternateLink,
  className,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[#f7f5f2] font-sans antialiased dark:bg-[#141a19]">
      <div className="grid min-h-screen lg:grid-cols-[1fr_1.05fr]">
        <AuthBrandingPanel />

        <AuthFormShell
          title={title}
          description={description}
          footer={footer}
          alternateLink={alternateLink}
          className={className}
        >
          {children}
        </AuthFormShell>
      </div>
    </div>
  );
}
