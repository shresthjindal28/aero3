"use client";

import { useState } from "react";

import { retryAiJob } from "@/features/admin/api/ai-jobs-admin.api";
import { PageContainer } from "@/shared/ui/layout/page-container";
import { PageHeader } from "@/shared/ui/layout/page-header";
import { Button } from "@/shared/ui/primitives/button";
import { Input } from "@/shared/ui/primitives/input";
import { toast } from "sonner";

export function AiJobsPage() {
  const [jobId, setJobId] = useState("");
  const [isRetrying, setIsRetrying] = useState(false);

  return (
    <PageContainer>
      <PageHeader
        title="AI Jobs"
        description="Monitor and retry AI processing jobs"
      />

      <div className="mt-6 space-y-4 rounded-xl border border-border/60 bg-card/50 p-6">
        <p className="text-sm text-muted-foreground">
          Global AI job listing requires a backend admin endpoint. Per-consultation
          jobs are available via the API. Use retry for failed jobs by ID.
        </p>

        <div className="flex max-w-md gap-2">
          <Input
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
            placeholder="Job ID"
            aria-label="AI job ID"
          />
          <Button
            type="button"
            disabled={!jobId || isRetrying}
            onClick={async () => {
              setIsRetrying(true);
              try {
                await retryAiJob(jobId);
                toast.success("Job retry requested");
              } catch {
                toast.error("Retry failed");
              } finally {
                setIsRetrying(false);
              }
            }}
          >
            Retry
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {["Workers", "Queue depth", "Failed jobs"].map((label) => (
            <div
              key={label}
              className="rounded-lg border border-border/40 bg-muted/10 p-4 text-sm"
            >
              <p className="text-muted-foreground">{label}</p>
              <p className="mt-1 font-medium">Monitoring placeholder</p>
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
