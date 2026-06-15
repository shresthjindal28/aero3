import type { Capability } from "@/shared/auth/permissions/capabilities";
import type { ActorType } from "@/types/domain/actor.types";

export const roleCapabilityMap: Record<ActorType, Capability[]> = {
  doctor: [
    "dashboard:view",
    "patients:read",
    "patients:write",
    "consultations:read",
    "consultations:write",
    "sessions:read",
    "sessions:record",
    "transcripts:read",
    "soap:read",
    "soap:write",
    "memory:read",
    "documents:read",
    "documents:write",
    "settings:read",
    "settings:write",
    "notifications:read",
  ],
  receptionist: [
    "dashboard:view",
    "patients:read",
    "consultations:read",
    "settings:read",
    "notifications:read",
  ],
};

export function getCapabilitiesForRole(actorType: ActorType): Capability[] {
  return roleCapabilityMap[actorType];
}
