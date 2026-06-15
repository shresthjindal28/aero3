import { Stethoscope } from "lucide-react";

import { ResumeVisitButton } from "@/features/dashboard/components/resume-visit-button";

type ActiveVisitBannerProps = {
  consultationId: string;
  patientName: string;
  chiefComplaint?: string | null;
  hasActiveSession: boolean;
};

export function ActiveVisitBanner({
  consultationId,
  patientName,
  chiefComplaint,
  hasActiveSession,
}: ActiveVisitBannerProps) {
  return (
    <section className="rounded-2xl border border-border/50 bg-card p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-muted/30">
            <Stethoscope className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {hasActiveSession ? "Visit in progress" : "Active visit"}
            </p>
            <p className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
              {patientName}
            </p>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {chiefComplaint ?? "Continue documenting this visit"}
            </p>
          </div>
        </div>

        <ResumeVisitButton consultationId={consultationId} className="shrink-0" />
      </div>
    </section>
  );
}
