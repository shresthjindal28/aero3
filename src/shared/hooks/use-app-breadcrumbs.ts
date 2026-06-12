"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";

import {
  resolveBreadcrumbs,
  UUID_PATTERN,
  type BreadcrumbSegment,
} from "@/config/breadcrumbs.config";
import { useConsultation } from "@/features/consultations/hooks/use-consultation";
import { usePatient } from "@/features/patients/hooks/use-patient";
import { useSession } from "@/features/sessions/hooks/use-session";
import { routes } from "@/shared/constants/routes";

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
      pathname.endsWith("/prescription")
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
        { label: "Prescription" },
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

    if (patientId) {
      const patientName = patient?.full_name ?? "Patient";
      const detailHref = routes.app.patientDetail(patientId);
      const patientTrail: BreadcrumbSegment[] = [
        { label: "Patients", href: routes.app.patients },
        { label: patientName, href: detailHref },
      ];

      if (pathname.endsWith("/consultations/new")) {
        return [...patientTrail, { label: "New consultation" }];
      }

      if (pathname.endsWith("/edit")) {
        return [...patientTrail, { label: "Edit" }];
      }

      if (pathname.endsWith("/memory")) {
        return [...patientTrail, { label: "Memory" }];
      }

      if (pathname.endsWith("/documents")) {
        return [...patientTrail, { label: "Documents" }];
      }

      if (pathname === detailHref) {
        return [
          { label: "Patients", href: routes.app.patients },
          { label: patientName },
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
