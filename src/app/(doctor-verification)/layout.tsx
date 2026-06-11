import { RequireAuth } from "@/shared/auth/guards/require-auth";

export default function DoctorVerificationLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RequireAuth actorType="doctor">
      <div className="theme-doctor min-h-screen bg-background px-4 py-10">
        <div className="mx-auto max-w-3xl">{children}</div>
      </div>
    </RequireAuth>
  );
}
