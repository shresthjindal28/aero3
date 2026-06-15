import type { DoctorProfile } from "@/features/auth/types/actor.types";
import type { DoctorOnboardingStatus } from "@/features/onboarding/types/onboarding.types";

export type ApiSuccessResponse<T> = T;

export type TokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
};

export type DoctorLoginResponse = TokenResponse & {
  doctor: DoctorProfile;
  onboarding_status: DoctorOnboardingStatus;
};
