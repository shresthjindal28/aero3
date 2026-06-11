"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuthStore } from "@/features/auth/store/auth.store";
import { getDefaultRouteForActor } from "@/features/auth/utils/actor-resolver";

export function useAuthRedirect() {
  const router = useRouter();
  const { isAuthenticated, actorType, isHydrated } = useAuthStore();

  useEffect(() => {
    if (!isHydrated || !isAuthenticated || !actorType) return;
    router.replace(getDefaultRouteForActor(actorType));
  }, [actorType, isAuthenticated, isHydrated, router]);
}
