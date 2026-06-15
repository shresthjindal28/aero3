import {
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
  { label: "Visits", href: routes.app.consultations, icon: Stethoscope },
  { label: "Active visits", href: routes.app.sessions, icon: Mic },
];

export const doctorSettingsNavigation: NavItem[] = [
  { label: "Settings", href: routes.app.settings, icon: Settings },
];
