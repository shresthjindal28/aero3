"use client";

import { useAuthStore } from "@/features/auth/store/auth.store";
import type { Capability } from "@/shared/auth/permissions/capabilities";
import { getCapabilitiesForRole } from "@/shared/auth/permissions/role-capability-map";

export function useCapability(capability: Capability): boolean {
  const actorType = useAuthStore((state) => state.actorType);

  if (!actorType) {
    return false;
  }

  return getCapabilitiesForRole(actorType).includes(capability);
}

export function useCapabilities(required: Capability[]): boolean {
  const actorType = useAuthStore((state) => state.actorType);

  if (!actorType) {
    return false;
  }

  const granted = new Set(getCapabilitiesForRole(actorType));
  return required.every((capability) => granted.has(capability));
}
