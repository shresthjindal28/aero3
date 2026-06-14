import {
  BriefcaseMedical,
  FileText,
  LayoutDashboard,
  Mic,
  Settings,
  Stethoscope,
  Users,
  type LucideIcon,
} from "lucide-react";

import { routes } from "@/shared/constants/routes";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  disabled?: boolean;
};

export const doctorNavigation: NavItem[] = [
  { label: "Today's practice", href: routes.app.dashboard, icon: LayoutDashboard },
  { label: "Patients", href: routes.app.patients, icon: Users },
  { label: "Consultations", href: routes.app.consultations, icon: Stethoscope },
  { label: "Live visits", href: routes.app.sessions, icon: Mic },
];

export const doctorSettingsNavigation: NavItem[] = [
  { label: "Settings", href: routes.app.settings, icon: Settings },
];

export const adminNavigation: NavItem[] = [
  { label: "Dashboard", href: routes.admin.dashboard, icon: LayoutDashboard },
  { label: "Doctors", href: routes.admin.doctors, icon: BriefcaseMedical },
  { label: "Verification", href: routes.admin.verification, icon: Users },
  { label: "AI Jobs", href: routes.admin.aiJobs, icon: FileText },
  { label: "Settings", href: routes.admin.settings, icon: Settings },
];
