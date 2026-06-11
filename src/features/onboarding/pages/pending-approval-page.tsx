"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useDoctorLogout, useDoctorMe } from "@/features/auth/hooks/use-doctor-auth";
import { resolveDoctorPostAuthRoute } from "@/features/auth/utils/doctor-route-resolver";
import { persistDoctorAccessState } from "@/features/auth/utils/token-storage";
import { useOnboardingStatus } from "@/features/onboarding/hooks/use-onboarding";
import { routes } from "@/shared/constants/routes";
import { PageLoader } from "@/shared/ui/feedback/page-loader";
import { Button } from "@/shared/ui/primitives/button";

export function PendingApprovalPage() {
  const router = useRouter();
  const logout = useDoctorLogout();
  const { data: doctor, isLoading: doctorLoading } = useDoctorMe();
  const { data: status, isLoading: statusLoading, refetch } = useOnboardingStatus();

  useEffect(() => {
    if (!doctor || !status) return;

    if (doctor.verification_status === "approved") {
      persistDoctorAccessState("approved", true);
      void resolveDoctorPostAuthRoute().then((route) => router.replace(route));
      return;
    }

    if (!status.verification_submitted) {
      router.replace(routes.auth.doctorOnboarding);
    }
  }, [doctor, status, router]);

  if (doctorLoading || statusLoading) {
    return <PageLoader label="Checking application status..." />;
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 text-center">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Application under review</h1>
        <p className="text-muted-foreground">
          Thanks {doctor?.full_name}. Your profile and documents have been submitted.
          An admin will review your application before you can access the dashboard.
        </p>
      </div>

      <div className="rounded-xl border border-border/60 bg-card/50 p-4 text-left text-sm">
        <p>
          <span className="text-muted-foreground">Status:</span>{" "}
          <span className="capitalize">{doctor?.verification_status}</span>
        </p>
        <p className="mt-2">
          <span className="text-muted-foreground">Email:</span> {doctor?.email}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button type="button" onClick={() => void refetch()}>
          Refresh status
        </Button>
        <Button type="button" variant="outline" onClick={logout}>
          Sign out
        </Button>
      </div>
    </div>
  );
}
