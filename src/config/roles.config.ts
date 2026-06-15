import type { ActorType } from "@/types/domain/actor.types";

export const rolesConfig = {
  doctor: {
    id: "doctor" as const satisfies ActorType,
    label: "Doctor",
    defaultRoute: "/dashboard",
    loginRoute: "/doctor/login",
  },
  receptionist: {
    id: "receptionist" as const satisfies ActorType,
    label: "Receptionist",
    defaultRoute: "/reception",
    loginRoute: "/reception/login",
  },
} as const;

export const actorTypes = Object.values(rolesConfig).map((role) => role.id);
