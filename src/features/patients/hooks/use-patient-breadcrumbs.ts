"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";

import { resolveBreadcrumbs, type BreadcrumbSegment } from "@/config/breadcrumbs.config";
import { usePatient } from "@/features/patients/hooks/use-patient";
import { routes } from "@/shared/constants/routes";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function usePatientBreadcrumbs(): BreadcrumbSegment[] {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const patientId =
    segments[0] === "patients" && segments[1] && UUID_PATTERN.test(segments[1])
      ? segments[1]
      : null;

  const { data: patient } = usePatient(patientId ?? "", Boolean(patientId));

  return useMemo(() => {
    const base = resolveBreadcrumbs(pathname);

    if (!patientId || !patient) {
      return base;
    }

    const patientLabel = patient.full_name;
    const detailHref = routes.app.patientDetail(patientId);

    if (pathname.endsWith("/edit")) {
      return [
        { label: "Patients", href: routes.app.patients },
        { label: patientLabel, href: detailHref },
        { label: "Edit" },
      ];
    }

    if (pathname === detailHref) {
      return [
        { label: "Patients", href: routes.app.patients },
        { label: patientLabel },
      ];
    }

    return base;
  }, [pathname, patient, patientId]);
}
