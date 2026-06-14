import type { Consultation } from "@/features/consultations/types/consultation.types";

export type ConsultationFilter = "active" | "waiting" | "needs-note" | "all";

export const CONSULTATION_FILTER_LABELS: Record<ConsultationFilter, string> = {
  active: "Active visits",
  waiting: "Waiting patients",
  "needs-note": "Notes to complete",
  all: "All visits",
};

export function parseConsultationFilter(
  value: string | null | undefined,
): ConsultationFilter {
  if (
    value === "active" ||
    value === "waiting" ||
    value === "needs-note" ||
    value === "all"
  ) {
    return value;
  }
  return "all";
}

export function filterConsultations(
  consultations: Consultation[],
  filter: ConsultationFilter,
): Consultation[] {
  switch (filter) {
    case "active":
      return consultations.filter((consultation) => consultation.status === "active");
    case "waiting":
      return consultations.filter((consultation) => consultation.status === "scheduled");
    case "needs-note":
      return consultations.filter((consultation) =>
        ["active", "completed"].includes(consultation.status),
      );
    default:
      return consultations;
  }
}
