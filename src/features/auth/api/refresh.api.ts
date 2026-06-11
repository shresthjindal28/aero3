import { adminRefresh } from "@/features/auth/api/admin-auth.api";
import { doctorRefresh } from "@/features/auth/api/doctor-auth.api";
import type { TokenResponse } from "@/lib/api/types/api-response.types";
import type { ActorType } from "@/types/domain/actor.types";

export async function refreshAccessToken(
  actorType: ActorType,
  refreshToken: string,
): Promise<TokenResponse> {
  switch (actorType) {
    case "admin":
      return adminRefresh(refreshToken);
    case "doctor":
    default:
      return doctorRefresh(refreshToken);
  }
}
