"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  doctorLogin,
  doctorSignup,
  getDoctorMe,
} from "@/features/auth/api/doctor-auth.api";
import type { LoginFormValues } from "@/features/auth/schemas/login.schema";
import type { DoctorSignupFormValues } from "@/features/auth/schemas/signup.schema";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useTokenStore } from "@/features/auth/store/token.store";
import { getDefaultRouteForActor } from "@/features/auth/utils/actor-resolver";
import { invalidationHelpers } from "@/lib/query/invalidation-helpers";
import { queryKeys } from "@/shared/constants/query-keys";

export function useDoctorMe(enabled = true) {
  return useQuery({
    queryKey: queryKeys.doctor.me,
    queryFn: getDoctorMe,
    enabled,
  });
}

export function useDoctorLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: LoginFormValues) => doctorLogin(values),
    onSuccess: (tokens) => {
      useTokenStore.getState().setTokens({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        actorType: "doctor",
      });
      useAuthStore.getState().setSession("doctor");
      void invalidationHelpers.invalidateAuth(queryClient, "doctor");
    },
  });
}

export function useDoctorSignup() {
  return useMutation({
    mutationFn: (values: DoctorSignupFormValues) => doctorSignup(values),
  });
}

export function useDoctorLogout() {
  const queryClient = useQueryClient();

  return () => {
    useAuthStore.getState().reset();
    queryClient.clear();
  };
}

export function getDoctorPostLoginRoute() {
  return getDefaultRouteForActor("doctor");
}
