import type { TokenResponse } from "@/lib/api/types/api-response.types";

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type TokenPairResponse = TokenResponse;
