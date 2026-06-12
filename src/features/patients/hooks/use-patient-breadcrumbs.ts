"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";

import {
  resolveBreadcrumbs,
  UUID_PATTERN,
  type BreadcrumbSegment,
} from "@/config/breadcrumbs.config";
import { usePatient } from "@/features/patients/hooks/use-patient";
import { routes } from "@/shared/constants/routes";

export function usePatientBreadcrumbs(): BreadcrumbSegment[] {
  const pathname = usePathname();
  const patientMatch = pathname.match(/^\/patients\/([^/]+)/);
  const patientId =
    patientMatch?.[1] && UUID_PATTERN.test(patientMatch[1]) ? patientMatch[1] : null;

  const { data: patient } = usePatient(patientId ?? "", Boolean(patientId));

  return useMemo(() => {
    if (!patientId) {
      return resolveBreadcrumbs(pathname);
    }

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

    return resolveBreadcrumbs(pathname);
  }, [pathname, patient, patientId]);
}
