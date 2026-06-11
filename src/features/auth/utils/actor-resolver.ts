import { rolesConfig } from "@/config/roles.config";
import type { ActorType } from "@/types/domain/actor.types";

export function getDefaultRouteForActor(actorType: ActorType): string {
  switch (actorType) {
    case "admin":
      return rolesConfig.admin.defaultRoute;
    case "receptionist":
      return rolesConfig.receptionist.defaultRoute;
    case "doctor":
    default:
      return rolesConfig.doctor.defaultRoute;
  }
}

export function getLoginRouteForActor(actorType: ActorType): string {
  switch (actorType) {
    case "admin":
      return rolesConfig.admin.loginRoute;
    case "receptionist":
      return rolesConfig.receptionist.loginRoute;
    case "doctor":
    default:
      return rolesConfig.doctor.loginRoute;
  }
}
