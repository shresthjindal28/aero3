import type { ConsultationStatus } from "@/types/domain/enums";

export type Consultation = {
  id: string;
  doctor_id: string;
  patient_id: string;
  chief_complaint: string | null;
  status: ConsultationStatus;
  started_at: string | null;
  ended_at: string | null;
  duration_seconds: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ConsultationCreateInput = {
  patient_id: string;
  chief_complaint?: string | null;
  status?: ConsultationStatus;
};

export type ConsultationUpdateInput = {
  chief_complaint?: string | null;
  status?: ConsultationStatus;
  started_at?: string | null;
  ended_at?: string | null;
  duration_seconds?: number | null;
  is_active?: boolean;
};

export type TimelineEventType =
  | "patient_created"
  | "consultation_created"
  | "consultation_completed"
  | "consultation_cancelled"
  | "soap_approved"
  | "transcript_generated"
  | "memory_updated";

export type TimelineEvent = {
  id: string;
  type: TimelineEventType;
  title: string;
  description?: string;
  timestamp: string;
  href?: string;
};
