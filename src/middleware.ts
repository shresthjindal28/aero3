import { NextResponse, type NextRequest } from "next/server";

import { authConfig } from "@/config/auth.config";
import { rolesConfig } from "@/config/roles.config";
import {
  getActorTypeForPath,
  isAuthRoute,
  isDoctorVerificationRoute,
  isProtectedRoute,
  requiresApprovedDoctor,
} from "@/shared/auth/middleware-helpers/route-matcher";
import type { ActorType } from "@/types/domain/actor.types";

function getActorTypeFromRequest(request: NextRequest): ActorType | null {
  const actorType = request.cookies.get(authConfig.cookieKeys.actorType)?.value;
  if (actorType === "doctor" || actorType === "admin" || actorType === "receptionist") {
    return actorType;
  }
  return null;
}

function hasAccessToken(request: NextRequest): boolean {
  return Boolean(request.cookies.get(authConfig.cookieKeys.accessToken)?.value);
}

function getDoctorAccessState(request: NextRequest): string | null {
  return request.cookies.get(authConfig.cookieKeys.doctorAccessState)?.value ?? null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = hasAccessToken(request);
  const actorType = getActorTypeFromRequest(request);

  if (isAuthRoute(pathname) && isAuthenticated && actorType) {
    if (actorType === "admin") {
      return NextResponse.redirect(
        new URL(rolesConfig.admin.defaultRoute, request.url),
      );
    }

    const accessState = getDoctorAccessState(request);
    const doctorRoute =
      accessState === "approved"
        ? rolesConfig.doctor.defaultRoute
        : accessState === "awaiting_review"
          ? "/doctor/pending-approval"
          : "/doctor/onboarding";

    return NextResponse.redirect(new URL(doctorRoute, request.url));
  }

  if (!isProtectedRoute(pathname)) {
    return NextResponse.next();
  }

  if (!isAuthenticated) {
    const requiredActor = getActorTypeForPath(pathname);
    const loginRoute =
      requiredActor === "admin"
        ? rolesConfig.admin.loginRoute
        : rolesConfig.doctor.loginRoute;
    return NextResponse.redirect(new URL(loginRoute, request.url));
  }

  const requiredActor = getActorTypeForPath(pathname);
  if (requiredActor && actorType && requiredActor !== actorType) {
    const loginRoute =
      actorType === "admin"
        ? rolesConfig.admin.loginRoute
        : rolesConfig.doctor.loginRoute;
    return NextResponse.redirect(new URL(loginRoute, request.url));
  }

  if (
    isAuthenticated &&
    actorType === "doctor" &&
    requiresApprovedDoctor(pathname) &&
    getDoctorAccessState(request) !== "approved"
  ) {
    const accessState = getDoctorAccessState(request);
    const redirectRoute =
      accessState === "awaiting_review"
        ? "/doctor/pending-approval"
        : "/doctor/onboarding";
    return NextResponse.redirect(new URL(redirectRoute, request.url));
  }

  if (
    isAuthenticated &&
    actorType === "doctor" &&
    isDoctorVerificationRoute(pathname) &&
    getDoctorAccessState(request) === "approved"
  ) {
    return NextResponse.redirect(new URL(rolesConfig.doctor.defaultRoute, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
