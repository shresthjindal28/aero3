import { doctorRefresh } from "@/features/auth/api/doctor-auth.api";
import type { TokenResponse } from "@/lib/api/types/api-response.types";

export async function refreshAccessToken(
  refreshToken: string,
): Promise<TokenResponse> {
  return doctorRefresh(refreshToken);
}
