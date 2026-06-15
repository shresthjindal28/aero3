import type { DoctorProfile } from "@/features/auth/types/actor.types";
import type {
  LoginCredentials,
  SignupDoctorInput,
} from "@/features/auth/types/auth.types";
import { apiClient } from "@/lib/api/client";
import { authClient } from "@/lib/api/auth-client";
import type { DoctorLoginResponse, TokenResponse } from "@/lib/api/types/api-response.types";

export async function doctorSignup(
  payload: SignupDoctorInput,
): Promise<DoctorProfile> {
  const { data } = await apiClient.post<DoctorProfile>("/doctors/signup", payload);
  return data;
}

export async function doctorLogin(
  payload: LoginCredentials,
): Promise<DoctorLoginResponse> {
  const { data } = await apiClient.post<DoctorLoginResponse>("/doctors/login", payload);
  return data;
}

export async function doctorRefresh(refreshToken: string): Promise<TokenResponse> {
  const { data } = await authClient.post<TokenResponse>("/doctors/refresh", {
    refresh_token: refreshToken,
  });
  return data;
}

export async function getDoctorMe(): Promise<DoctorProfile> {
  const { data } = await apiClient.get<DoctorProfile>("/doctors/me");
  return data;
}
