"use client";

import { useState } from "react";

import { AuditLogsTable, ActorTypeFilter } from "@/features/admin/components/audit-logs-table";
import { useAdminAuditLogs } from "@/features/admin/hooks/use-admin-audit-logs";
import { PageLoader } from "@/shared/ui/feedback/page-loader";
import { PageContainer } from "@/shared/ui/layout/page-container";
import { PageHeader } from "@/shared/ui/layout/page-header";
import { Button } from "@/shared/ui/primitives/button";
import { Input } from "@/shared/ui/primitives/input";

const PAGE_SIZE = 50;

export function AuditLogsPage() {
  const [days, setDays] = useState(90);
  const [actorType, setActorType] = useState<"" | "doctor" | "admin">("");
  const [actionFilter, setActionFilter] = useState("");
  const [appliedAction, setAppliedAction] = useState("");
  const [offset, setOffset] = useState(0);

  const { data, isLoading, isFetching } = useAdminAuditLogs({
    days,
    actor_type: actorType || undefined,
    action: appliedAction || undefined,
    limit: PAGE_SIZE,
    offset,
  });

  if (isLoading || !data) {
    return <PageLoader label="Loading audit logs..." />;
  }

  const page = Math.floor(offset / PAGE_SIZE) + 1;
  const totalPages = Math.max(1, Math.ceil(data.total / PAGE_SIZE));
  const showingFrom = data.total === 0 ? 0 : offset + 1;
  const showingTo = Math.min(offset + data.items.length, data.total);

  return (
    <PageContainer>
      <PageHeader
        title="Audit Logs"
        description={`Platform activity for the last ${days} days · ${data.total.toLocaleString()} events stored`}
      />

      <div className="mt-6 flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label htmlFor="audit-days" className="text-xs text-muted-foreground">
            Period
          </label>
          <select
            id="audit-days"
            value={days}
            onChange={(e) => {
              setDays(Number(e.target.value));
              setOffset(0);
            }}
            className="flex h-10 rounded-lg border border-border/60 bg-background px-3 text-sm"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={180}>Last 180 days</option>
            <option value={365}>Last year</option>
          </select>
        </div>

        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Actor</span>
          <ActorTypeFilter
            value={actorType}
            onChange={(value) => {
              setActorType(value);
              setOffset(0);
            }}
          />
        </div>

        <div className="min-w-[200px] flex-1 space-y-1">
          <label htmlFor="audit-action" className="text-xs text-muted-foreground">
            Action
          </label>
          <div className="flex gap-2">
            <Input
              id="audit-action"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              placeholder="e.g. patient.create"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setAppliedAction(actionFilter.trim());
                  setOffset(0);
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setAppliedAction(actionFilter.trim());
                setOffset(0);
              }}
            >
              Filter
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <AuditLogsTable logs={data.items} />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <p>
          Showing {showingFrom}–{showingTo} of {data.total.toLocaleString()}
          {isFetching ? " · refreshing…" : ""}
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={offset === 0}
            onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
          >
            Previous
          </Button>
          <span>
            Page {page} of {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={offset + PAGE_SIZE >= data.total}
            onClick={() => setOffset(offset + PAGE_SIZE)}
          >
            Next
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
