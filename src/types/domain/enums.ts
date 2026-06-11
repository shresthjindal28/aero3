export type VerificationStatus = "pending" | "approved" | "rejected";

export type GenderType = "male" | "female" | "other" | "prefer_not_to_say";

export type ConsultationStatus = "scheduled" | "active" | "completed" | "cancelled";

export type SessionStatus = "active" | "paused" | "ended" | "failed";

export type AiJobStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";
