import type { ActorType } from "@/types/domain/actor.types";

const doctorPrefixes = [
  "/dashboard",
  "/patients",
  "/consultations",
  "/sessions",
  "/settings",
  "/notifications",
  "/memory",
  "/documents",
];

const doctorVerificationPrefixes = [
  "/doctor/onboarding",
  "/doctor/pending-approval",
];

export function isDoctorVerificationRoute(pathname: string): boolean {
  return doctorVerificationPrefixes.some((prefix) => pathname.startsWith(prefix));
}

export function getActorTypeForPath(pathname: string): ActorType | null {
  if (
    doctorPrefixes.some((prefix) => pathname.startsWith(prefix)) ||
    isDoctorVerificationRoute(pathname)
  ) {
    return "doctor";
  }

  return null;
}

export function isAuthRoute(pathname: string): boolean {
  return (
    pathname.startsWith("/doctor/login") || pathname.startsWith("/doctor/signup")
  );
}

export function isProtectedRoute(pathname: string): boolean {
  if (isAuthRoute(pathname)) {
    return false;
  }
  if (isDoctorVerificationRoute(pathname)) {
    return true;
  }
  return getActorTypeForPath(pathname) !== null;
}

export function requiresApprovedDoctor(pathname: string): boolean {
  return (
    getActorTypeForPath(pathname) === "doctor" && !isDoctorVerificationRoute(pathname)
  );
}
