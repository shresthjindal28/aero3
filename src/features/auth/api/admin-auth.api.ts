import type { AdminProfile } from "@/features/auth/types/actor.types";
import type {
  LoginCredentials,
  SignupAdminInput,
} from "@/features/auth/types/auth.types";
import { apiClient } from "@/lib/api/client";
import { authClient } from "@/lib/api/auth-client";
import type { TokenResponse } from "@/lib/api/types/api-response.types";

export async function adminSignup(
  payload: SignupAdminInput,
): Promise<AdminProfile> {
  const { data } = await apiClient.post<AdminProfile>("/admins/signup", payload);
  return data;
}

export async function adminLogin(
  payload: LoginCredentials,
): Promise<TokenResponse> {
  const { data } = await apiClient.post<TokenResponse>("/admins/login", payload);
  return data;
}

export async function adminRefresh(refreshToken: string): Promise<TokenResponse> {
  const { data } = await authClient.post<TokenResponse>("/admins/refresh", {
    refresh_token: refreshToken,
  });
  return data;
}

export async function getAdminMe(): Promise<AdminProfile> {
  const { data } = await apiClient.get<AdminProfile>("/admins/me");
  return data;
}
