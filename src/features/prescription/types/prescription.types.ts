export type Prescription = {
  id: string;
  consultation_id: string;
  html_content: string;
  plain_text_content: string | null;
  generation_provider: string | null;
  generation_version: string | null;
  approved_by_doctor: boolean;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PrescriptionUpdateInput = {
  html_content?: string;
  plain_text_content?: string;
};
