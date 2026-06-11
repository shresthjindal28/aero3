import type { SessionStatus } from "@/types/domain/enums";

export type Session = {
  id: string;
  consultation_id: string;
  doctor_id: string;
  status: SessionStatus;
  started_at: string;
  ended_at: string | null;
  last_chunk_number: number;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

export type SessionStartInput = {
  consultation_id: string;
  metadata?: Record<string, unknown>;
};
