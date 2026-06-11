import type { DoctorProfile } from "@/features/auth/types/actor.types";
import type {
  DoctorDocument,
  DoctorDocumentCreateInput,
  DoctorOnboardingStatus,
  DoctorProfileUpdateInput,
  DoctorVerificationSubmitInput,
} from "@/features/onboarding/types/onboarding.types";
import { apiClient } from "@/lib/api/client";

export async function getOnboardingStatus(): Promise<DoctorOnboardingStatus> {
  const { data } = await apiClient.get<DoctorOnboardingStatus>(
    "/doctors/me/onboarding-status",
  );
  return data;
}

export async function updateDoctorProfile(
  payload: DoctorProfileUpdateInput,
): Promise<DoctorProfile> {
  const { data } = await apiClient.patch<DoctorProfile>("/doctors/me", payload);
  return data;
}

export async function submitDoctorVerification(
  payload: DoctorVerificationSubmitInput,
): Promise<DoctorOnboardingStatus> {
  const { data } = await apiClient.post<DoctorOnboardingStatus>(
    "/doctors/me/verification",
    payload,
  );
  return data;
}

export async function listDoctorDocuments(): Promise<DoctorDocument[]> {
  const { data } = await apiClient.get<DoctorDocument[]>("/doctor-documents/");
  return data;
}

export async function createDoctorDocument(
  payload: DoctorDocumentCreateInput,
): Promise<DoctorDocument> {
  const { data } = await apiClient.post<DoctorDocument>(
    "/doctor-documents/",
    payload,
  );
  return data;
}

export async function deleteDoctorDocument(documentId: string): Promise<void> {
  await apiClient.delete(`/doctor-documents/${documentId}`);
}
