"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useDoctorMe } from "@/features/auth/hooks/use-doctor-auth";
import { getDoctorRouteForVerificationStatus } from "@/features/auth/utils/doctor-route-resolver";
import { readDoctorAccessState } from "@/features/auth/utils/token-storage";
import { useOnboardingStatus } from "@/features/onboarding/hooks/use-onboarding";

type RequireApprovedDoctorProps = {
  children: React.ReactNode;
};

export function RequireApprovedDoctor({ children }: RequireApprovedDoctorProps) {
  const router = useRouter();
  const cachedAccess = readDoctorAccessState();
  const likelyApproved = cachedAccess === "approved";

  const { data: doctor } = useDoctorMe();
  const { data: status } = useOnboardingStatus(!likelyApproved);

  useEffect(() => {
    if (!doctor) return;

    if (doctor.verification_status !== "approved") {
      router.replace(
        getDoctorRouteForVerificationStatus(
          doctor.verification_status,
          status?.verification_submitted ?? false,
        ),
      );
    }
  }, [doctor, status, router]);

  if (doctor && doctor.verification_status !== "approved") {
    return null;
  }

  return <>{children}</>;
}
