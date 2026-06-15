import { apiClient } from "@/lib/api/client";

export type AuditLogActorType = "doctor" | "admin";

export type AuditLogEntry = {
  id: string;
  actor_type: AuditLogActorType;
  actor_id: string;
  actor_name: string | null;
  actor_email: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
};

export type AuditLogListResponse = {
  items: AuditLogEntry[];
  total: number;
  limit: number;
  offset: number;
  days: number;
};

export type AuditLogQueryParams = {
  days?: number;
  actor_type?: AuditLogActorType;
  action?: string;
  resource_type?: string;
  limit?: number;
  offset?: number;
};

export async function listAuditLogs(
  params: AuditLogQueryParams = {},
): Promise<AuditLogListResponse> {
  const { data } = await apiClient.get<AuditLogListResponse>("/admins/audit-logs", {
    params,
  });
  return data;
}
