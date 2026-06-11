"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  adminLogin,
  adminSignup,
  getAdminMe,
} from "@/features/auth/api/admin-auth.api";
import type { LoginFormValues } from "@/features/auth/schemas/login.schema";
import type { AdminSignupFormValues } from "@/features/auth/schemas/signup.schema";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useTokenStore } from "@/features/auth/store/token.store";
import { getDefaultRouteForActor } from "@/features/auth/utils/actor-resolver";
import { invalidationHelpers } from "@/lib/query/invalidation-helpers";
import { queryKeys } from "@/shared/constants/query-keys";

export function useAdminMe(enabled = true) {
  return useQuery({
    queryKey: queryKeys.admin.me,
    queryFn: getAdminMe,
    enabled,
  });
}

export function useAdminLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: LoginFormValues) => adminLogin(values),
    onSuccess: (tokens) => {
      useTokenStore.getState().setTokens({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        actorType: "admin",
      });
      useAuthStore.getState().setSession("admin");
      void invalidationHelpers.invalidateAuth(queryClient, "admin");
    },
  });
}

export function useAdminSignup() {
  return useMutation({
    mutationFn: (values: AdminSignupFormValues) => adminSignup(values),
  });
}

export function useAdminLogout() {
  const queryClient = useQueryClient();

  return () => {
    useAuthStore.getState().reset();
    queryClient.clear();
  };
}

export function getAdminPostLoginRoute() {
  return getDefaultRouteForActor("admin");
}
