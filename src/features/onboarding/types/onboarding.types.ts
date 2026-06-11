import type { GenderType, VerificationStatus } from "@/types/domain/enums";

export type DoctorDocumentType =
  | "medical_certificate"
  | "government_id"
  | "medical_license"
  | "specialization_certificate"
  | "hospital_affiliation";

export type DoctorDocument = {
  id: string;
  document_type: DoctorDocumentType;
  file_name: string;
  file_url: string;
  uploaded_at: string;
};

export type DoctorOnboardingStatus = {
  verification_status: VerificationStatus;
  profile_complete: boolean;
  documents_complete: boolean;
  verification_submitted: boolean;
  can_access_dashboard: boolean;
  missing_profile_fields: string[];
  missing_document_types: DoctorDocumentType[];
  rejection_notes: string | null;
};

export type DoctorProfileUpdateInput = {
  phone: string;
  date_of_birth: string;
  gender: GenderType;
  qualification: string;
  specialization: string;
  years_of_experience: number;
  hospital_name: string;
  city: string;
  state: string;
  country: string;
  profile_picture_url: string;
};

export type DoctorVerificationSubmitInput = {
  registration_number: string;
  medical_council: string;
};

export type DoctorDocumentCreateInput = {
  document_type: DoctorDocumentType;
  file_name: string;
  file_url: string;
};

export type DoctorAdminDetail = {
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
  verification: {
    registration_number: string | null;
    medical_council: string | null;
    qualification: string | null;
    specialization: string | null;
    verification_notes: string | null;
    status: VerificationStatus;
    verified_at: string | null;
  } | null;
  documents: DoctorDocument[];
};
