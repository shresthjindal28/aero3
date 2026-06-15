"use client";

import { useQuery } from "@tanstack/react-query";

import {
  listAuditLogs,
  type AuditLogQueryParams,
} from "@/features/admin/api/audit-logs-admin.api";
import { adminQueries } from "@/features/admin/api/admin-queries";

export function useAdminAuditLogs(params: AuditLogQueryParams = {}) {
  const days = params.days ?? 90;
  const limit = params.limit ?? 50;
  const offset = params.offset ?? 0;

  return useQuery({
    ...adminQueries.auditLogs({ ...params, days, limit, offset }),
    queryFn: () => listAuditLogs({ ...params, days, limit, offset }),
  });
}
