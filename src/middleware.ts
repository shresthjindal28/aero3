import { NextResponse, type NextRequest } from "next/server";

import { authConfig } from "@/config/auth.config";
import { rolesConfig } from "@/config/roles.config";
import {
  getActorTypeForPath,
  isAuthRoute,
  isProtectedRoute,
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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = hasAccessToken(request);
  const actorType = getActorTypeFromRequest(request);

  if (isAuthRoute(pathname) && isAuthenticated && actorType) {
    const defaultRoute =
      actorType === "admin"
        ? rolesConfig.admin.defaultRoute
        : rolesConfig.doctor.defaultRoute;
    return NextResponse.redirect(new URL(defaultRoute, request.url));
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

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
