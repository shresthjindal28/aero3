"use client";

import type { ReactNode } from "react";

import type { Capability } from "@/shared/auth/permissions/capabilities";
import { useCapabilities } from "@/shared/auth/permissions/use-capability";

type RequirePermissionProps = {
  capabilities: Capability[];
  children: ReactNode;
  fallback?: ReactNode;
};

export function RequirePermission({
  capabilities,
  children,
  fallback = null,
}: RequirePermissionProps) {
  const allowed = useCapabilities(capabilities);

  if (!allowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
