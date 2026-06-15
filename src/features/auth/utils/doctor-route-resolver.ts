import type { QueryClient } from "@tanstack/react-query";

import { getDoctorMe } from "@/features/auth/api/doctor-auth.api";
import { persistDoctorAccessState } from "@/features/auth/utils/token-storage";
import { getOnboardingStatus } from "@/features/onboarding/api/onboarding.api";
import type { DoctorOnboardingStatus } from "@/features/onboarding/types/onboarding.types";
import { queryKeys } from "@/shared/constants/query-keys";
import { routes } from "@/shared/constants/routes";
import type { DoctorProfile } from "@/features/auth/types/actor.types";
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

/** Seed React Query from enriched login response — no extra network calls. */
export function seedDoctorPostAuthCacheFromLogin(
  queryClient: QueryClient,
  profile: DoctorProfile,
  onboardingStatus: DoctorOnboardingStatus,
): string {
  queryClient.setQueryData(queryKeys.doctor.me, profile);
  queryClient.setQueryData(queryKeys.doctor.onboarding, onboardingStatus);

  persistDoctorAccessState(
    profile.verification_status,
    onboardingStatus.verification_submitted,
  );

  return getDoctorRouteForVerificationStatus(
    profile.verification_status,
    onboardingStatus.verification_submitted,
  );
}

/** @deprecated Prefer seedDoctorPostAuthCacheFromLogin after login. */
export async function seedDoctorPostAuthCache(
  queryClient: QueryClient,
): Promise<string> {
  const [profile, status] = await Promise.all([getDoctorMe(), getOnboardingStatus()]);

  return seedDoctorPostAuthCacheFromLogin(queryClient, profile, status);
}

/** @deprecated Use seedDoctorPostAuthCacheFromLogin — avoids duplicate network calls after login. */
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
