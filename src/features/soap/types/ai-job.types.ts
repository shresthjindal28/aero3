export type AiJobStatus =
  | "pending"
  | "queued"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";

export type AiJob = {
  id: string;
  consultation_id: string;
  session_id: string | null;
  job_type: string;
  status: AiJobStatus;
  priority: string;
  attempt_count: number;
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

export type SoapGenerateInput = {
  consultation_id: string;
  session_id?: string | null;
  regenerate?: boolean;
};
