import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ConsultationStatusBadge } from "@/features/consultations/components/consultation-status-badge";
import type { Consultation } from "@/features/consultations/types/consultation.types";
import {
  formatConsultationDate,
  formatDuration,
} from "@/features/consultations/utils/consultation.utils";
import { routes } from "@/shared/constants/routes";
import { Button } from "@/shared/ui/primitives/button";

type ConsultationCardProps = {
  consultation: Consultation;
};

export function ConsultationCard({ consultation }: ConsultationCardProps) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm transition-colors hover:bg-accent/20">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <ConsultationStatusBadge status={consultation.status} />
            <span className="text-xs text-muted-foreground">
              {formatConsultationDate(consultation.created_at)}
            </span>
          </div>
          <h3 className="text-base font-medium">
            {consultation.chief_complaint ?? "No chief complaint"}
          </h3>
          <p className="text-sm text-muted-foreground">
            Duration {formatDuration(consultation.duration_seconds)}
          </p>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link href={routes.app.consultationDetail(consultation.id)}>
            View
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
