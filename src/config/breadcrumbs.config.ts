import { routes } from "@/shared/constants/routes";

export type BreadcrumbSegment = {
  label: string;
  href?: string;
};

type BreadcrumbRouteMap = Record<string, BreadcrumbSegment[]>;

export const breadcrumbRoutes: BreadcrumbRouteMap = {
  [routes.app.dashboard]: [{ label: "Dashboard" }],
  [routes.app.patients]: [{ label: "Patients" }],
  [routes.app.patientsNew]: [
    { label: "Patients", href: routes.app.patients },
    { label: "New" },
  ],
  [routes.app.consultations]: [{ label: "Consultations" }],
  [routes.app.sessions]: [{ label: "Live Sessions" }],
  [routes.app.memory]: [{ label: "Memory" }],
  [routes.app.documents]: [{ label: "Documents" }],
  [routes.app.settings]: [{ label: "Settings" }],
  [routes.app.settingsProfile]: [
    { label: "Settings", href: routes.app.settings },
    { label: "Profile" },
  ],
  [routes.app.settingsSecurity]: [
    { label: "Settings", href: routes.app.settings },
    { label: "Security" },
  ],
  [routes.admin.dashboard]: [{ label: "Dashboard" }],
  [routes.admin.doctors]: [{ label: "Doctors" }],
  [routes.admin.aiJobs]: [{ label: "AI Jobs" }],
  [routes.admin.settings]: [{ label: "Settings" }],
  [routes.admin.settingsProfile]: [
    { label: "Settings", href: routes.admin.settings },
    { label: "Profile" },
  ],
};

function formatSegmentLabel(segment: string): string {
  return segment
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function resolveBreadcrumbs(pathname: string): BreadcrumbSegment[] {
  if (breadcrumbRoutes[pathname]) {
    return breadcrumbRoutes[pathname];
  }

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) {
    return [{ label: "Home" }];
  }

  return segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;
    const isLast = index === segments.length - 1;
    return {
      label: formatSegmentLabel(segment),
      href: isLast ? undefined : href,
    };
  });
}
