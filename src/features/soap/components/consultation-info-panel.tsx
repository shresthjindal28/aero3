import Link from "next/link";

import { ConsultationStatusBadge } from "@/features/consultations/components/consultation-status-badge";
import type { Consultation } from "@/features/consultations/types/consultation.types";
import { formatDuration } from "@/features/consultations/utils/consultation.utils";
import type { Patient } from "@/features/patients/types/patient.types";
import { ApprovalBadge } from "@/features/soap/components/approval-badge";
import type { SoapNote } from "@/features/soap/types/soap.types";
import { formatDateTime } from "@/lib/utils/date";
import { routes } from "@/shared/constants/routes";

type ConsultationInfoPanelProps = {
  consultation: Consultation;
  patient: Patient;
  soap: SoapNote | null | undefined;
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="text-sm">{value}</p>
    </div>
  );
}

export function ConsultationInfoPanel({
  consultation,
  patient,
  soap,
}: ConsultationInfoPanelProps) {
  return (
    <aside className="flex h-full min-h-0 flex-col rounded-xl border border-border/60 bg-card/30">
      <div className="border-b border-border/60 px-4 py-3">
        <h2 className="text-sm font-medium">Consultation</h2>
      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4">
        <div className="space-y-2">
          <Link
            href={routes.app.patientDetail(patient.id)}
            className="text-lg font-semibold hover:underline"
          >
            {patient.full_name}
          </Link>
          {patient.phone ? (
            <p className="text-sm text-muted-foreground">{patient.phone}</p>
          ) : null}
        </div>

        <InfoRow
          label="Chief complaint"
          value={consultation.chief_complaint ?? "—"}
        />
        <InfoRow label="Duration" value={formatDuration(consultation.duration_seconds)} />
        <InfoRow
          label="Started"
          value={
            consultation.started_at
              ? formatDateTime(consultation.started_at)
              : "Not started"
          }
        />
        <InfoRow
          label="Ended"
          value={
            consultation.ended_at
              ? formatDateTime(consultation.ended_at)
              : "Not ended"
          }
        />

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Status
          </p>
          <ConsultationStatusBadge status={consultation.status} />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            SOAP approval
          </p>
          <ApprovalBadge soap={soap} />
          {soap?.approved_by_doctor ? (
            <p className="text-xs text-muted-foreground">
              Approved by doctor
              {soap.approved_at ? ` · ${formatDateTime(soap.approved_at)}` : ""}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">Pending doctor approval</p>
          )}
        </div>

        <Link
          href={routes.app.consultationDetail(consultation.id)}
          className="inline-block text-sm text-primary hover:underline"
        >
          View consultation details
        </Link>
      </div>
    </aside>
  );
}
