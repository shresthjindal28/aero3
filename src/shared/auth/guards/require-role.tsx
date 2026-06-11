"use client";

import type { ReactNode } from "react";

import { RequireAuth } from "@/shared/auth/guards/require-auth";
import type { ActorType } from "@/types/domain/actor.types";

type RequireRoleProps = {
  role: ActorType;
  children: ReactNode;
  fallback?: ReactNode;
};

export function RequireRole({ role, children, fallback }: RequireRoleProps) {
  return (
    <RequireAuth actorType={role} fallback={fallback}>
      {children}
    </RequireAuth>
  );
}
