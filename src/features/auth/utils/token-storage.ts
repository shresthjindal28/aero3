import { authConfig } from "@/config/auth.config";
import type { ActorType } from "@/types/domain/actor.types";
import type { VerificationStatus } from "@/types/domain/enums";

const isBrowser = typeof window !== "undefined";

function setCookie(name: string, value: string, maxAgeDays: number) {
  if (!isBrowser) return;
  const maxAge = maxAgeDays * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function deleteCookie(name: string) {
  if (!isBrowser) return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

export function persistSession(input: {
  accessToken: string;
  refreshToken: string;
  actorType: ActorType;
}) {
  if (!isBrowser) return;

  localStorage.setItem(authConfig.storageKeys.accessToken, input.accessToken);
  localStorage.setItem(authConfig.storageKeys.refreshToken, input.refreshToken);
  localStorage.setItem(authConfig.storageKeys.actorType, input.actorType);

  setCookie(
    authConfig.cookieKeys.accessToken,
    input.accessToken,
    authConfig.cookieMaxAgeDays,
  );
  setCookie(
    authConfig.cookieKeys.refreshToken,
    input.refreshToken,
    authConfig.cookieMaxAgeDays,
  );
  setCookie(
    authConfig.cookieKeys.actorType,
    input.actorType,
    authConfig.cookieMaxAgeDays,
  );
}

export type DoctorAccessState =
  | "approved"
  | "awaiting_review"
  | "onboarding"
  | "rejected";

export function getDoctorAccessState(
  verificationStatus: VerificationStatus,
  verificationSubmitted: boolean,
): DoctorAccessState {
  if (verificationStatus === "approved") return "approved";
  if (verificationStatus === "rejected") return "rejected";
  if (verificationSubmitted) return "awaiting_review";
  return "onboarding";
}

export function persistDoctorAccessState(
  verificationStatus: VerificationStatus,
  verificationSubmitted: boolean,
) {
  if (!isBrowser) return;

  const accessState = getDoctorAccessState(verificationStatus, verificationSubmitted);

  localStorage.setItem(authConfig.storageKeys.verificationStatus, verificationStatus);
  localStorage.setItem(authConfig.storageKeys.doctorAccessState, accessState);
  setCookie(
    authConfig.cookieKeys.verificationStatus,
    verificationStatus,
    authConfig.cookieMaxAgeDays,
  );
  setCookie(
    authConfig.cookieKeys.doctorAccessState,
    accessState,
    authConfig.cookieMaxAgeDays,
  );
}

export function persistVerificationStatus(status: VerificationStatus) {
  persistDoctorAccessState(status, status === "pending");
}

export function readVerificationStatus(): VerificationStatus | null {
  if (!isBrowser) return null;

  const status = localStorage.getItem(authConfig.storageKeys.verificationStatus);
  if (status === "pending" || status === "approved" || status === "rejected") {
    return status;
  }
  return null;
}

export function readStoredSession(): {
  accessToken: string | null;
  refreshToken: string | null;
  actorType: ActorType | null;
} {
  if (!isBrowser) {
    return { accessToken: null, refreshToken: null, actorType: null };
  }

  const actorType = localStorage.getItem(authConfig.storageKeys.actorType);

  return {
    accessToken: localStorage.getItem(authConfig.storageKeys.accessToken),
    refreshToken: localStorage.getItem(authConfig.storageKeys.refreshToken),
    actorType:
      actorType === "doctor" || actorType === "admin" || actorType === "receptionist"
        ? actorType
        : null,
  };
}

export function clearSession() {
  if (!isBrowser) return;

  localStorage.removeItem(authConfig.storageKeys.accessToken);
  localStorage.removeItem(authConfig.storageKeys.refreshToken);
  localStorage.removeItem(authConfig.storageKeys.actorType);

  deleteCookie(authConfig.cookieKeys.accessToken);
  deleteCookie(authConfig.cookieKeys.refreshToken);
  deleteCookie(authConfig.cookieKeys.actorType);
  deleteCookie(authConfig.cookieKeys.verificationStatus);
  deleteCookie(authConfig.cookieKeys.doctorAccessState);

  localStorage.removeItem(authConfig.storageKeys.verificationStatus);
  localStorage.removeItem(authConfig.storageKeys.doctorAccessState);
}
