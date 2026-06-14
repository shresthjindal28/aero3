"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { rolesConfig } from "@/config/roles.config";
import { useAuthStore } from "@/features/auth/store/auth.store";
import type { ActorType } from "@/types/domain/actor.types";

type RequireAuthProps = {
  actorType: ActorType;
  children: ReactNode;
  fallback?: ReactNode;
};

export function RequireAuth({
  actorType,
  children,
  fallback = null,
}: RequireAuthProps) {
  const router = useRouter();
  const { isAuthenticated, actorType: currentActor, isHydrated } = useAuthStore();

  useEffect(() => {
    if (!isHydrated) return;

    if (!isAuthenticated || currentActor !== actorType) {
      const loginRoute =
        actorType === "admin"
          ? rolesConfig.admin.loginRoute
          : rolesConfig.doctor.loginRoute;
      router.replace(loginRoute);
    }
  }, [actorType, currentActor, isAuthenticated, isHydrated, router]);

  if (!isHydrated) {
    return <>{children}</>;
  }

  if (!isAuthenticated || currentActor !== actorType) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
