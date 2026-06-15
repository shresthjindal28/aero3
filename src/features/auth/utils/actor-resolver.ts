import { rolesConfig } from "@/config/roles.config";

export function getDefaultRouteForActor(
  actorType: "doctor" | "receptionist" = "doctor",
): string {
  switch (actorType) {
    case "receptionist":
      return rolesConfig.receptionist.defaultRoute;
    case "doctor":
    default:
      return rolesConfig.doctor.defaultRoute;
  }
}

export function getLoginRouteForActor(
  actorType: "doctor" | "receptionist" = "doctor",
): string {
  switch (actorType) {
    case "receptionist":
      return rolesConfig.receptionist.loginRoute;
    case "doctor":
    default:
      return rolesConfig.doctor.loginRoute;
  }
}
