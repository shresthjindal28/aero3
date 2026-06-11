import { RequireRole } from "@/shared/auth/guards/require-role";
import { DoctorAppShell } from "@/shared/ui/layout/doctor-app-shell";

export default function DoctorAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RequireRole role="doctor">
      <div className="theme-doctor">
        <DoctorAppShell>{children}</DoctorAppShell>
      </div>
    </RequireRole>
  );
}
