import { getDoctorMe } from "@/features/auth/api/doctor-auth.api";
import { persistDoctorAccessState } from "@/features/auth/utils/token-storage";
import { getOnboardingStatus } from "@/features/onboarding/api/onboarding.api";
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
