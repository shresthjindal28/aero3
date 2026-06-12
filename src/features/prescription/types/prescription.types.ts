export type Prescription = {
  id: string;
  doctor_id: string;
  patient_id: string;
  consultation_id: string;
  soap_note_id: string | null;
  parent_prescription_id: string | null;
  version_number: number;
  is_current: boolean;
  html_content: string;
  plain_text_content: string | null;
  generation_provider: string | null;
  generation_version: string | null;
  is_approved: boolean;
  approved_by_doctor: boolean;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PrescriptionVersionSummary = {
  id: string;
  version_number: number;
  is_current: boolean;
  is_approved: boolean;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
  parent_prescription_id: string | null;
};

export type PrescriptionListItem = {
  id: string;
  doctor_id: string;
  patient_id: string;
  consultation_id: string;
  version_number: number;
  is_current: boolean;
  is_approved: boolean;
  approved_at: string | null;
  created_at: string;
  plain_text_content: string | null;
  doctor_name: string | null;
  patient_name: string | null;
  consultation_date: string | null;
  chief_complaint: string | null;
  diagnosis_summary: string | null;
  medications_summary: string | null;
};

export type PrescriptionUpdateInput = {
  html_content?: string;
  plain_text_content?: string;
};
