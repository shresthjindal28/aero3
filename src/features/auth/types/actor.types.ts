import type { VerificationStatus } from "@/types/domain/enums";

export type DoctorProfile = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  date_of_birth: string | null;
  gender: string | null;
  qualification: string | null;
  specialization: string | null;
  years_of_experience: number | null;
  hospital_name: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  profile_picture_url: string | null;
  verification_status: VerificationStatus;
  email_verified: boolean;
  phone_verified: boolean;
  is_active: boolean;
};

export type AdminProfile = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
};
