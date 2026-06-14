import type { QueryClient } from "@tanstack/react-query";

import { getDoctorMe } from "@/features/auth/api/doctor-auth.api";
import { persistDoctorAccessState } from "@/features/auth/utils/token-storage";
import { getOnboardingStatus } from "@/features/onboarding/api/onboarding.api";
import { queryKeys } from "@/shared/constants/query-keys";
import { routes } from "@/shared/constants/routes";
import type { VerificationStatus } from "@/types/domain/enums";

export function getDoctorRouteForVerificationStatus(
  verificationStatus: VerificationStatus,
  verificationSubmitted: boolean,
): string {
  if (verificationStatus === "approved") {
    return routes.app.dashboard;
  }

  if (verificationStatus === "pending" && verificationSubmitted) {
    return routes.auth.doctorPendingApproval;
  }

  return routes.auth.doctorOnboarding;
}

export async function seedDoctorPostAuthCache(
  queryClient: QueryClient,
): Promise<string> {
  const [profile, status] = await Promise.all([getDoctorMe(), getOnboardingStatus()]);

  queryClient.setQueryData(queryKeys.doctor.me, profile);
  queryClient.setQueryData(queryKeys.doctor.onboarding, status);

  persistDoctorAccessState(
    profile.verification_status,
    status.verification_submitted,
  );

  return getDoctorRouteForVerificationStatus(
    profile.verification_status,
    status.verification_submitted,
  );
}

/** @deprecated Use seedDoctorPostAuthCache — avoids duplicate network calls after login. */
export async function resolveDoctorPostAuthRoute(): Promise<string> {
  const [profile, status] = await Promise.all([getDoctorMe(), getOnboardingStatus()]);

  persistDoctorAccessState(
    profile.verification_status,
    status.verification_submitted,
  );

  return getDoctorRouteForVerificationStatus(
    profile.verification_status,
    status.verification_submitted,
  );
}
