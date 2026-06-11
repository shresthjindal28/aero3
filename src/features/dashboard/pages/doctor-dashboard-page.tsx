"use client";

import Link from "next/link";

import { useDoctorDashboard } from "@/features/dashboard/hooks/use-doctor-dashboard";
import { routes } from "@/shared/constants/routes";
import { PageLoader } from "@/shared/ui/feedback/page-loader";
import { PageContainer } from "@/shared/ui/layout/page-container";
import { PageHeader } from "@/shared/ui/layout/page-header";
import { Button } from "@/shared/ui/primitives/button";

export function DoctorDashboardPage() {
  const { data, isLoading } = useDoctorDashboard();

  if (isLoading || !data) {
    return <PageLoader label="Loading dashboard..." />;
  }

  const metrics = [
    { label: "Patients", value: data.patientsCount },
    { label: "Consultations", value: data.consultationsCount },
    { label: "Active sessions", value: data.sessionsCount },
    { label: "Transcripts", value: data.transcriptCount },
    { label: "SOAP notes", value: data.soapCount },
    { label: "Memory profiles", value: data.memoryCount },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        description="Your clinical command center"
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-xl border border-border/60 bg-card/50 p-5"
          >
            <p className="text-sm text-muted-foreground">{metric.label}</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums">
              {metric.value}
            </p>
          </div>
        ))}
      </div>

      <section className="mt-8 rounded-xl border border-border/60 bg-card/50 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Recent consultations</h2>
          <Button type="button" variant="outline" size="sm" asChild>
            <Link href={routes.app.consultations}>View all</Link>
          </Button>
        </div>
        <ul className="mt-4 space-y-2">
          {data.recentConsultations.length === 0 ? (
            <li className="text-sm text-muted-foreground">No consultations yet.</li>
          ) : (
            data.recentConsultations.map((consultation) => (
              <li key={consultation.id}>
                <Link
                  href={routes.app.consultationDetail(consultation.id)}
                  className="flex items-center justify-between rounded-lg border border-border/40 px-3 py-2 text-sm hover:bg-muted/20"
                >
                  <span>{consultation.chief_complaint ?? "Consultation"}</span>
                  <span className="text-muted-foreground capitalize">
                    {consultation.status}
                  </span>
                </Link>
              </li>
            ))
          )}
        </ul>
      </section>
    </PageContainer>
  );
}
