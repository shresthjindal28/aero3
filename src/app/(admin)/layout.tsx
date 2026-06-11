import { RequireRole } from "@/shared/auth/guards/require-role";
import { AdminAppShell } from "@/shared/ui/layout/admin-app-shell";

export default function AdminPortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RequireRole role="admin">
      <div className="theme-admin">
        <AdminAppShell>{children}</AdminAppShell>
      </div>
    </RequireRole>
  );
}
