import type { Capability } from "@/shared/auth/permissions/capabilities";
import type { ActorType } from "@/types/domain/actor.types";

export type RouteAccess = {
  path: string;
  capabilities: Capability[];
  actors: ActorType[];
};

export const protectedRoutes: RouteAccess[] = [
  {
    path: "/dashboard",
    capabilities: ["dashboard:view"],
    actors: ["doctor"],
  },
  {
    path: "/patients",
    capabilities: ["patients:read"],
    actors: ["doctor", "receptionist"],
  },
  {
    path: "/consultations",
    capabilities: ["consultations:read"],
    actors: ["doctor", "receptionist"],
  },
  {
    path: "/sessions",
    capabilities: ["sessions:read"],
    actors: ["doctor"],
  },
  {
    path: "/settings",
    capabilities: ["settings:read"],
    actors: ["doctor", "admin", "receptionist"],
  },
  {
    path: "/admin",
    capabilities: ["admin:access"],
    actors: ["admin"],
  },
];
