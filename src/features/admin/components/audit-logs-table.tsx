"use client";

import type { AuditLogEntry } from "@/features/admin/api/audit-logs-admin.api";
import { cn } from "@/lib/utils/cn";

type AuditLogsTableProps = {
  logs: AuditLogEntry[];
};

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function AuditLogsTable({ logs }: AuditLogsTableProps) {
  if (logs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No audit logs found for this period.</p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border/60">
      <table className="w-full text-sm">
        <thead className="border-b border-border/60 bg-muted/20 text-left">
          <tr>
            <th className="px-4 py-3 font-medium">Time</th>
            <th className="px-4 py-3 font-medium">Actor</th>
            <th className="px-4 py-3 font-medium">Action</th>
            <th className="px-4 py-3 font-medium">Resource</th>
            <th className="px-4 py-3 font-medium">IP</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className="border-b border-border/40 last:border-0">
              <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                {formatTimestamp(log.created_at)}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">
                    {log.actor_name ?? "Unknown"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {log.actor_type}
                    {log.actor_email ? ` · ${log.actor_email}` : ""}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className="font-mono text-xs">{log.action}</span>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-col gap-0.5">
                  <span>{log.resource_type}</span>
                  {log.resource_id ? (
                    <span className="font-mono text-xs text-muted-foreground">
                      {log.resource_id.slice(0, 8)}…
                    </span>
                  ) : null}
                </div>
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {log.ip_address ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ActorTypeFilter({
  value,
  onChange,
}: {
  value: "" | "doctor" | "admin";
  onChange: (value: "" | "doctor" | "admin") => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as "" | "doctor" | "admin")}
      className={cn(
        "h-10 rounded-lg border border-border/60 bg-background px-3 text-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
      aria-label="Filter by actor type"
    >
      <option value="">All actors</option>
      <option value="doctor">Doctors</option>
      <option value="admin">Admins</option>
    </select>
  );
}
