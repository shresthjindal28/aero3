"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  ClipboardList,
  Stethoscope,
  Users,
  type LucideIcon,
} from "lucide-react";

import { ClinicalStatusBadge } from "@/features/dashboard/components/clinical-status-badge";
import { useDoctorDashboard } from "@/features/dashboard/hooks/use-doctor-dashboard";
import { routes } from "@/shared/constants/routes";
import { ApiErrorDisplay } from "@/shared/ui/feedback/api-error";
import { DashboardSkeleton } from "@/shared/ui/feedback/clinical-skeletons";
import { PageContainer } from "@/shared/ui/layout/page-container";
import { PageHeader } from "@/shared/ui/layout/page-header";
import { Button } from "@/shared/ui/primitives/button";
import { cn } from "@/lib/utils/cn";

function PriorityCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: number;
  hint: string;
  icon: LucideIcon;
  tone?: "default" | "urgent" | "calm";
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card/50 p-5",
        tone === "urgent" && "border-emerald-500/40 bg-emerald-500/5",
        tone === "calm" && "border-border/60",
        tone === "default" && "border-border/60",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        </div>
        <div className="rounded-lg bg-muted/60 p-2.5">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}

export function DoctorDashboardPage() {
  const { data, isLoading, isError, error, refetch } = useDoctorDashboard();

  return (
    <PageContainer>
      <PageHeader
        title="Today's practice"
        description="What needs your attention right now"
      />

      {isError ? (
        <ApiErrorDisplay
          error={(error as Error) ?? new Error("Unable to load your practice overview")}
          onRetry={() => void refetch()}
        />
      ) : isLoading && !data ? (
        <div className="mt-8">
          <DashboardSkeleton />
        </div>
      ) : data ? (
        <div className="mt-8 space-y-8">
          {data.primaryActive ? (
            <section className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                    Active consultation
                  </p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight">
                    {data.primaryActivePatient?.full_name ?? "Patient"}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {data.primaryActive.chief_complaint ?? "Continue documenting this visit"}
                  </p>
                </div>
                <Button asChild size="lg">
                  <Link href={routes.app.consultationDetail(data.primaryActive.id)}>
                    Resume visit
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </section>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <PriorityCard
              label="Active consultations"
              value={data.activeConsultations}
              hint="Visits in progress"
              icon={Stethoscope}
              tone="urgent"
            />
            <PriorityCard
              label="Waiting patients"
              value={data.waitingPatients}
              hint="Scheduled and ready"
              icon={CalendarClock}
            />
            <PriorityCard
              label="Pending clinical notes"
              value={data.pendingNotes}
              hint="SOAP notes to review"
              icon={ClipboardList}
            />
            <PriorityCard
              label="Today's patients"
              value={data.totalPatients}
              hint="On your panel"
              icon={Users}
              tone="calm"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-xl border border-border/60 bg-card/50 p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold">Action queue</h2>
                <Button type="button" variant="ghost" size="sm" asChild>
                  <Link href={routes.app.consultations}>See all</Link>
                </Button>
              </div>
              <ul className="mt-4 space-y-2">
                {data.actionQueue.length === 0 ? (
                  <li className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                    No patients waiting. Your queue is clear.
                  </li>
                ) : (
                  data.actionQueue.map(({ consultation, patientName }) => (
                    <li key={consultation.id}>
                      <Link
                        href={routes.app.consultationDetail(consultation.id)}
                        className="flex items-center justify-between gap-3 rounded-lg border border-border/40 px-4 py-3 transition-colors hover:bg-muted/30"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-base font-medium">{patientName}</p>
                          <p className="truncate text-sm text-muted-foreground">
                            {consultation.chief_complaint ?? "Open consultation"}
                          </p>
                        </div>
                        <ClinicalStatusBadge status={consultation.status} />
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </section>

            <section className="rounded-xl border border-border/60 bg-card/50 p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold">Recent patients</h2>
                <Button type="button" variant="ghost" size="sm" asChild>
                  <Link href={routes.app.patients}>Open panel</Link>
                </Button>
              </div>
              <ul className="mt-4 space-y-2">
                {data.recentPatients.length === 0 ? (
                  <li className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                    Add your first patient to begin consultations.
                  </li>
                ) : (
                  data.recentPatients.map((patient) => (
                    <li key={patient.id}>
                      <Link
                        href={routes.app.patientDetail(patient.id)}
                        className="flex items-center justify-between gap-3 rounded-lg border border-border/40 px-4 py-3 transition-colors hover:bg-muted/30"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-base font-medium">{patient.full_name}</p>
                          <p className="truncate text-sm text-muted-foreground">
                            {patient.phone ?? "No phone on file"}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </section>
          </div>
        </div>
      ) : null}
    </PageContainer>
  );
}
