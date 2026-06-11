"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";

import { resolveBreadcrumbs, type BreadcrumbSegment } from "@/config/breadcrumbs.config";
import { useConsultation } from "@/features/consultations/hooks/use-consultation";
import { usePatient } from "@/features/patients/hooks/use-patient";
import { useSession } from "@/features/sessions/hooks/use-session";
import { routes } from "@/shared/constants/routes";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function useAppBreadcrumbs(): BreadcrumbSegment[] {
  const pathname = usePathname();

  const patientMatch = pathname.match(/^\/patients\/([^/]+)/);
  const patientId =
    patientMatch?.[1] && UUID_PATTERN.test(patientMatch[1]) ? patientMatch[1] : null;

  const consultationMatch = pathname.match(/^\/consultations\/([^/]+)/);
  const consultationId =
    consultationMatch?.[1] && UUID_PATTERN.test(consultationMatch[1])
      ? consultationMatch[1]
      : null;

  const sessionMatch = pathname.match(/^\/sessions\/([^/]+)/);
  const sessionId =
    sessionMatch?.[1] && UUID_PATTERN.test(sessionMatch[1])
      ? sessionMatch[1]
      : null;

  const { data: patient } = usePatient(patientId ?? "", Boolean(patientId));
  const { data: consultation } = useConsultation(
    consultationId ?? "",
    Boolean(consultationId),
  );
  const { data: consultationPatient } = usePatient(
    consultation?.patient_id ?? "",
    Boolean(consultation),
  );
  const { data: session } = useSession(sessionId ?? "", Boolean(sessionId));
  const { data: sessionConsultation } = useConsultation(
    session?.consultation_id ?? "",
    Boolean(session?.consultation_id),
  );
  const { data: sessionPatient } = usePatient(
    sessionConsultation?.patient_id ?? "",
    Boolean(sessionConsultation?.patient_id),
  );

  return useMemo(() => {
    if (sessionId && session && sessionConsultation) {
      const patientName = sessionPatient?.full_name ?? "Patient";
      return [
        { label: "Live Sessions", href: routes.app.sessions },
        {
          label: patientName,
          href: routes.app.patientDetail(sessionConsultation.patient_id),
        },
        {
          label: sessionConsultation.chief_complaint ?? "Live session",
        },
      ];
    }

    if (
      consultationId &&
      consultation &&
      pathname.endsWith("/soap")
    ) {
      const patientName = consultationPatient?.full_name ?? "Patient";
      return [
        { label: "Consultations", href: routes.app.consultations },
        {
          label: patientName,
          href: routes.app.patientDetail(consultation.patient_id),
        },
        {
          label: consultation.chief_complaint ?? "Consultation",
          href: routes.app.consultationDetail(consultationId),
        },
        { label: "SOAP Note" },
      ];
    }

    if (consultationId && consultation) {
      const patientName = consultationPatient?.full_name ?? "Patient";
      return [
        { label: "Consultations", href: routes.app.consultations },
        {
          label: patientName,
          href: routes.app.patientDetail(consultation.patient_id),
        },
        {
          label: consultation.chief_complaint ?? "Consultation",
        },
      ];
    }

    if (patientId && patient) {
      if (pathname.endsWith("/consultations/new")) {
        return [
          { label: "Patients", href: routes.app.patients },
          { label: patient.full_name, href: routes.app.patientDetail(patientId) },
          { label: "New consultation" },
        ];
      }

      if (pathname.endsWith("/edit")) {
        return [
          { label: "Patients", href: routes.app.patients },
          { label: patient.full_name, href: routes.app.patientDetail(patientId) },
          { label: "Edit" },
        ];
      }

      if (pathname === routes.app.patientDetail(patientId)) {
        return [
          { label: "Patients", href: routes.app.patients },
          { label: patient.full_name },
        ];
      }
    }

    return resolveBreadcrumbs(pathname);
  }, [
    consultation,
    consultationId,
    consultationPatient,
    patient,
    patientId,
    pathname,
    session,
    sessionConsultation,
    sessionId,
    sessionPatient,
  ]);
}
