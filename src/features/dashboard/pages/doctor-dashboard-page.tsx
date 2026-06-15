"use client";

import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import {
  CalendarClock,
  ClipboardList,
  Stethoscope,
  Users,
} from "lucide-react";

import { useDoctorMe } from "@/features/auth/hooks/use-doctor-auth";
import { ActiveVisitBanner } from "@/features/dashboard/components/active-visit-banner";
import { ClinicalStatusBadge } from "@/features/dashboard/components/clinical-status-badge";
import { DashboardHeader } from "@/features/dashboard/components/dashboard-header";
import { DashboardListRow } from "@/features/dashboard/components/dashboard-list-row";
import { DashboardPanel } from "@/features/dashboard/components/dashboard-panel";
import { PriorityCard } from "@/features/dashboard/components/priority-card";
import { useDoctorDashboard } from "@/features/dashboard/hooks/use-doctor-dashboard";
import { listSessionsByConsultation } from "@/features/sessions/api/sessions.api";
import { useActiveSessionsMap } from "@/features/sessions/hooks/use-active-sessions-map";
import { routes } from "@/shared/constants/routes";
import { queryKeys } from "@/shared/constants/query-keys";
import { ApiErrorDisplay } from "@/shared/ui/feedback/api-error";
import { DashboardSkeleton } from "@/shared/ui/feedback/clinical-skeletons";
import { PageContainer } from "@/shared/ui/layout/page-container";
import { Button } from "@/shared/ui/primitives/button";

export function DoctorDashboardPage() {
  const queryClient = useQueryClient();
  const { data: doctor } = useDoctorMe();
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
    <PageContainer className="max-w-6xl lg:py-6">
      <DashboardHeader doctorName={doctor?.full_name} />

      {isError ? (
        <div className="mt-6">
          <ApiErrorDisplay
            error={(error as Error) ?? new Error("Unable to load your practice overview")}
            onRetry={() => void refetch()}
          />
        </div>
      ) : isLoading && !data ? (
        <div className="mt-6">
          <DashboardSkeleton />
        </div>
      ) : data ? (
        <div className="mt-6 space-y-6">
          {data.primaryActive ? (
            <ActiveVisitBanner
              consultationId={data.primaryActive.id}
              patientName={data.primaryActivePatient?.full_name ?? "Patient"}
              chiefComplaint={data.primaryActive.chief_complaint}
              hasActiveSession={sessionByConsultationId.has(data.primaryActive.id)}
            />
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <PriorityCard
              label="Active visits"
              value={data.activeConsultations}
              hint="Visits in progress"
              icon={Stethoscope}
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
              href={routes.app.patients}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-5 lg:gap-5">
            <DashboardPanel
              title="Action queue"
              description="Patients waiting or in progress"
              actionLabel="See all visits"
              actionHref={routes.app.consultations}
              className="lg:col-span-3"
            >
              {data.actionQueue.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 px-4 py-10 text-center">
                  <p className="text-sm font-medium">Queue is clear</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    No patients waiting right now.
                  </p>
                  <Button type="button" variant="outline" size="sm" className="mt-4" asChild>
                    <Link href={routes.app.consultations}>View visits</Link>
                  </Button>
                </div>
              ) : (
                <ul className="divide-y divide-border/40">
                  {data.actionQueue.map(({ consultation, patientName }) => {
                    const activeSession = sessionByConsultationId.get(consultation.id);
                    const href = activeSession
                      ? routes.app.sessionDetail(activeSession.id)
                      : routes.app.consultationDetail(consultation.id);

                    return (
                      <li key={consultation.id}>
                        <DashboardListRow
                          href={href}
                          title={patientName}
                          subtitle={consultation.chief_complaint ?? "Open visit"}
                          trailing={<ClinicalStatusBadge status={consultation.status} />}
                        />
                      </li>
                    );
                  })}
                </ul>
              )}
            </DashboardPanel>

            <DashboardPanel
              title="Recent patients"
              description="Recently added to your panel"
              actionLabel="Open panel"
              actionHref={routes.app.patients}
              className="lg:col-span-2"
            >
              {data.recentPatients.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 px-4 py-10 text-center">
                  <p className="text-sm font-medium">No patients yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Add your first patient to begin visits.
                  </p>
                  <Button type="button" variant="outline" size="sm" className="mt-4" asChild>
                    <Link href={routes.app.patients}>Add patient</Link>
                  </Button>
                </div>
              ) : (
                <ul className="divide-y divide-border/40">
                  {data.recentPatients.map((patient) => (
                    <li key={patient.id}>
                      <DashboardListRow
                        href={routes.app.patientDetail(patient.id)}
                        title={patient.full_name}
                        subtitle={patient.phone ?? "No phone on file"}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </DashboardPanel>
          </div>
        </div>
      ) : null}
    </PageContainer>
  );
}
