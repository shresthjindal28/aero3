import type { Patient } from "@/features/patients/types/patient.types";
import type {
  Consultation,
  TimelineEvent,
} from "@/features/consultations/types/consultation.types";
import { formatDate, formatDateTime } from "@/lib/utils/date";
import { routes } from "@/shared/constants/routes";
import type { ConsultationStatus } from "@/types/domain/enums";

export function formatConsultationStatus(status: ConsultationStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds || seconds <= 0) return "—";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes === 0) return `${remainingSeconds}s`;
  if (remainingSeconds === 0) return `${minutes}m`;
  return `${minutes}m ${remainingSeconds}s`;
}

export function buildChiefComplaintPayload(
  chiefComplaint: string,
  notes?: string,
): string {
  const trimmedNotes = notes?.trim();
  if (!trimmedNotes) return chiefComplaint.trim();
  return `${chiefComplaint.trim()}\n\nNotes: ${trimmedNotes}`;
}

export function buildPatientTimeline(
  patient: Patient,
  consultations: Consultation[],
): TimelineEvent[] {
  const events: TimelineEvent[] = [
    {
      id: `patient-created-${patient.id}`,
      type: "patient_created",
      title: "Patient created",
      description: `${patient.full_name} was added to your practice.`,
      timestamp: patient.created_at,
    },
  ];

  consultations.forEach((consultation) => {
    events.push({
      id: `consultation-created-${consultation.id}`,
      type: "consultation_created",
      title: "Consultation created",
      description: consultation.chief_complaint ?? "No chief complaint recorded",
      timestamp: consultation.created_at,
      href: routes.app.consultationDetail(consultation.id),
    });

    if (consultation.status === "completed") {
      events.push({
        id: `consultation-completed-${consultation.id}`,
        type: "consultation_completed",
        title: "Consultation completed",
        description: consultation.chief_complaint ?? "Consultation marked complete",
        timestamp: consultation.updated_at,
        href: routes.app.consultationDetail(consultation.id),
      });
    }

    if (consultation.status === "cancelled") {
      events.push({
        id: `consultation-cancelled-${consultation.id}`,
        type: "consultation_cancelled",
        title: "Consultation cancelled",
        description: consultation.chief_complaint ?? "Consultation was cancelled",
        timestamp: consultation.updated_at,
        href: routes.app.consultationDetail(consultation.id),
      });
    }
  });

  return events.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}

export function groupTimelineByDate(events: TimelineEvent[]): Record<string, TimelineEvent[]> {
  return events.reduce<Record<string, TimelineEvent[]>>((groups, event) => {
    const key = formatDate(event.timestamp);
    if (!groups[key]) groups[key] = [];
    groups[key].push(event);
    return groups;
  }, {});
}

export function formatConsultationDate(value: string): string {
  return formatDateTime(value);
}
