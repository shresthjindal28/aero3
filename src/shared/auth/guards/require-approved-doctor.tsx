"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useDoctorMe } from "@/features/auth/hooks/use-doctor-auth";
import { getDoctorRouteForVerificationStatus } from "@/features/auth/utils/doctor-route-resolver";
import { useOnboardingStatus } from "@/features/onboarding/hooks/use-onboarding";
import { PageLoader } from "@/shared/ui/feedback/page-loader";

type RequireApprovedDoctorProps = {
  children: React.ReactNode;
};

export function RequireApprovedDoctor({ children }: RequireApprovedDoctorProps) {
  const router = useRouter();
  const { data: doctor, isLoading: doctorLoading } = useDoctorMe();
  const { data: status, isLoading: statusLoading } = useOnboardingStatus();

  useEffect(() => {
    if (!doctor || !status) return;

    if (doctor.verification_status !== "approved") {
      router.replace(
        getDoctorRouteForVerificationStatus(
          doctor.verification_status,
          status.verification_submitted,
        ),
      );
    }
  }, [doctor, status, router]);

  if (doctorLoading || statusLoading) {
    return <PageLoader label="Checking account status..." />;
  }

  if (!doctor || doctor.verification_status !== "approved") {
    return <PageLoader label="Redirecting..." />;
  }

  return <>{children}</>;
}
