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

const adminPrefixes = ["/admin"];

export function getActorTypeForPath(pathname: string): ActorType | null {
  if (adminPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return "admin";
  }

  if (doctorPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return "doctor";
  }

  return null;
}

export function isAuthRoute(pathname: string): boolean {
  return (
    pathname.startsWith("/doctor/login") ||
    pathname.startsWith("/doctor/signup") ||
    pathname.startsWith("/admin/login") ||
    pathname.startsWith("/admin/signup")
  );
}

export function isProtectedRoute(pathname: string): boolean {
  if (isAuthRoute(pathname)) {
    return false;
  }
  return getActorTypeForPath(pathname) !== null;
}
