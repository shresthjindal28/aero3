export type SoapNote = {
  id: string;
  consultation_id: string;
  subjective: string | null;
  objective: string | null;
  assessment: string | null;
  plan: string | null;
  approved_by_doctor: boolean;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
};

export type SoapGenerateInput = {
  consultation_id: string;
  session_id?: string | null;
  regenerate?: boolean;
};

export type SoapNoteCreateInput = {
  consultation_id: string;
  subjective?: string | null;
  objective?: string | null;
  assessment?: string | null;
  plan?: string | null;
};

export type SoapNoteUpdateInput = {
  subjective?: string | null;
  objective?: string | null;
  assessment?: string | null;
  plan?: string | null;
};

export type SoapSectionKey = "subjective" | "objective" | "assessment" | "plan";

export type SoapDraft = Record<SoapSectionKey, string>;

export type SoapApprovalStatus = "draft" | "approved";
