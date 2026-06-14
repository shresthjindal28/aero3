"use client";

import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import {
  ArrowRight,
  CalendarClock,
  ClipboardList,
  Stethoscope,
  Users,
} from "lucide-react";

import { ResumeVisitButton } from "@/features/dashboard/components/resume-visit-button";
import { PriorityCard } from "@/features/dashboard/components/priority-card";
import { ClinicalStatusBadge } from "@/features/dashboard/components/clinical-status-badge";
import { useDoctorDashboard } from "@/features/dashboard/hooks/use-doctor-dashboard";
import { listSessionsByConsultation } from "@/features/sessions/api/sessions.api";
import { useActiveSessionsMap } from "@/features/sessions/hooks/use-active-sessions-map";
import { routes } from "@/shared/constants/routes";
import { queryKeys } from "@/shared/constants/query-keys";
import { ApiErrorDisplay } from "@/shared/ui/feedback/api-error";
import { DashboardSkeleton } from "@/shared/ui/feedback/clinical-skeletons";
import { PageContainer } from "@/shared/ui/layout/page-container";
import { PageHeader } from "@/shared/ui/layout/page-header";
import { Button } from "@/shared/ui/primitives/button";

export function DoctorDashboardPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error, refetch } = useDoctorDashboard();

  const sessionLookupIds = useMemo(() => {
    if (!data) return [];
    const ids = data.actionQueue.map((item) => item.consultation.id);
    if (data.primaryActive) {
      ids.unshift(data.primaryActive.id);
    }
    return ids;
  }, [data]);

  const { sessionByConsultationId } = useActiveSessionsMap(sessionLookupIds);

  useEffect(() => {
    if (!data?.primaryActive) return;
    void queryClient.prefetchQuery({
      queryKey: queryKeys.sessions.byConsultation(data.primaryActive.id),
      queryFn: () => listSessionsByConsultation(data.primaryActive!.id),
      staleTime: 60_000,
    });
  }, [data?.primaryActive, queryClient]);

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
                    {sessionByConsultationId.has(data.primaryActive.id)
                      ? "Visit in progress"
                      : "Active visit"}
                  </p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight">
                    {data.primaryActivePatient?.full_name ?? "Patient"}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {data.primaryActive.chief_complaint ?? "Continue documenting this visit"}
                  </p>
                </div>
                <ResumeVisitButton consultationId={data.primaryActive.id} />
              </div>
            </section>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <PriorityCard
              label="Active visits"
              value={data.activeConsultations}
              hint="Visits in progress"
              icon={Stethoscope}
              tone="urgent"
              href={routes.app.consultationsWithFilter("active")}
            />
            <PriorityCard
              label="Waiting patients"
              value={data.waitingPatients}
              hint="Scheduled and ready"
              icon={CalendarClock}
              href={routes.app.consultationsWithFilter("waiting")}
            />
            <PriorityCard
              label="Notes to complete"
              value={data.pendingNotes}
              hint="Draft or sign clinical notes"
              icon={ClipboardList}
              href={routes.app.consultationsWithFilter("needs-note")}
            />
            <PriorityCard
              label="Patients on panel"
              value={data.totalPatients}
              hint="Your patient list"
              icon={Users}
              tone="calm"
              href={routes.app.patients}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-xl border border-border/60 bg-card/50 p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold">Action queue</h2>
                <Button type="button" variant="ghost" size="sm" asChild>
                  <Link href={routes.app.consultations}>See all visits</Link>
                </Button>
              </div>
              <ul className="mt-4 space-y-2">
                {data.actionQueue.length === 0 ? (
                  <li className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                    No patients waiting. Your queue is clear.
                  </li>
                ) : (
                  data.actionQueue.map(({ consultation, patientName }) => {
                    const activeSession = sessionByConsultationId.get(consultation.id);
                    const href = activeSession
                      ? routes.app.sessionDetail(activeSession.id)
                      : routes.app.consultationDetail(consultation.id);

                    return (
                      <li key={consultation.id}>
                        <Link
                          href={href}
                          className="flex items-center justify-between gap-3 rounded-lg border border-border/40 px-4 py-3 transition-colors hover:bg-muted/30"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-base font-medium">{patientName}</p>
                            <p className="truncate text-sm text-muted-foreground">
                              {consultation.chief_complaint ?? "Open visit"}
                            </p>
                          </div>
                          <ClinicalStatusBadge status={consultation.status} />
                        </Link>
                      </li>
                    );
                  })
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
                    Add your first patient to begin visits.
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
