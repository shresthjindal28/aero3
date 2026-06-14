"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchSystemSnapshot } from "@/features/admin/api/system-monitoring.api";
import { PageLoader } from "@/shared/ui/feedback/page-loader";
import { PageContainer } from "@/shared/ui/layout/page-container";
import { PageHeader } from "@/shared/ui/layout/page-header";

const REFRESH_MS = 60_000;

function StatusBadge({ status }: { status: string }) {
  const color =
    status === "healthy"
      ? "text-emerald-600"
      : status === "unknown" || status === "degraded"
        ? "text-amber-600"
        : "text-red-600";

  return <span className={`font-medium capitalize ${color}`}>{status}</span>;
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/50 p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

export function SystemHealthPage() {
  const { data, isLoading, dataUpdatedAt } = useQuery({
    queryKey: ["admin", "system-health"],
    queryFn: fetchSystemSnapshot,
    refetchInterval: REFRESH_MS,
  });

  if (isLoading || !data) {
    return <PageLoader label="Loading system health..." />;
  }

  const healthEntries = Object.entries(data.health);
  const lastUpdated = new Date(dataUpdatedAt).toLocaleTimeString();

  return (
    <PageContainer>
      <PageHeader
        title="System Health"
        description={`Production monitoring dashboard · refreshed every 60s · last update ${lastUpdated}`}
      />

      <section className="mt-6">
        <h2 className="mb-3 text-lg font-semibold">System Status</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {healthEntries.map(([key, status]) => (
            <div
              key={key}
              className="rounded-xl border border-border/60 bg-card/50 p-4"
            >
              <p className="text-sm text-muted-foreground capitalize">{key}</p>
              <p className="mt-1 text-xl">
                <StatusBadge status={status} />
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Workers</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <MetricCard label="Active workers" value={data.workers.active} />
          <MetricCard label="Dead workers" value={data.workers.dead} />
          <MetricCard label="Total workers" value={data.workers.total} />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Queue & Jobs</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Pending jobs" value={data.queue.pending ?? 0} />
          <MetricCard label="Processing" value={data.queue.processing ?? 0} />
          <MetricCard label="Failed jobs" value={data.queue.failed ?? 0} />
          <MetricCard
            label="Failure rate"
            value={`${((data.jobs.failure_rate as number) ?? 0) * 100}%`}
          />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Redis & Cache</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Memory used"
            value={`${Math.round(((data.cache.redis_memory_used_bytes as number) ?? 0) / 1024 / 1024)} MB`}
          />
          <MetricCard label="Cache hits" value={(data.cache.cache_hits as number) ?? 0} />
          <MetricCard label="Cache misses" value={(data.cache.cache_misses as number) ?? 0} />
          <MetricCard
            label="Hit ratio"
            value={`${(((data.cache.hit_ratio as number) ?? 0) * 100).toFixed(1)}%`}
          />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Storage & Costs</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Total files" value={(data.storage.total_files as number) ?? 0} />
          <MetricCard
            label="Total storage"
            value={`${Math.round(((data.storage.total_storage_bytes as number) ?? 0) / 1024 / 1024)} MB`}
          />
          <MetricCard
            label="Estimated spend"
            value={`$${((data.costs.estimated_spend as number) ?? 0).toFixed(2)}`}
          />
          <MetricCard
            label="Active WebSockets"
            value={(data.websockets.active_connections as number) ?? 0}
          />
        </div>
      </section>
    </PageContainer>
  );
}
